import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { gzipSync } from "node:zlib";
import { chromium } from "playwright";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { optimize } from "svgo";
import { animationPlan } from "./animation-plan.mjs";
import { hoverDuration, loopDuration } from "./animations.mjs";
import { drawPlan } from "./draw-plan.mjs";
import { serveAnimations } from "./serve-animations.mjs";

const baseline = JSON.parse(
  await readFile(new URL("../tests/fixtures/static-0.2.0.json", import.meta.url), "utf8"),
);
const css = await readFile(new URL("../dist/animations.css", import.meta.url), "utf8");
const components = createRequire(import.meta.url)("../dist/react/index.cjs");
const manifest = JSON.parse(await readFile(new URL("../dist/icons.json", import.meta.url), "utf8"));
const report = {
  version: components.version,
  icons: 200,
  animated: 0,
  static: [],
  css: {
    bytes: Buffer.byteLength(css),
    gzipBytes: gzipSync(css).length,
    budgetGzipBytes: 40 * 1024,
  },
  snapshots: 0,
  checks: [],
};
report.version = JSON.parse(await readFile(new URL("../package.json", import.meta.url))).version;
assert(report.css.gzipBytes < report.css.budgetGzipBytes);
const server = await serveAnimations(0);
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1040, height: 800 },
    reducedMotion: "no-preference",
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  // Capture an entire sheet at once, comparing buffers in the same browser/context.
  const sheetStyle =
    "body{margin:0}#sheet{display:grid;grid-template-columns:repeat(20,48px);width:960px}.sample{width:48px;height:56px;display:flex;align-items:center;justify-content:center}";
  const component = (name) =>
    components[
      `${name
        .split("-")
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join("")}Icon`
    ];
  for (const kind of ["svg", "react"]) {
    for (const size of [16, 24, 48]) {
      for (const dark of [false, true]) {
        const sheet = (old) =>
          manifest
            .map(({ name }) => {
              let svg;
              if (old)
                svg =
                  kind === "svg"
                    ? optimize(baseline[name], { plugins: ["preset-default", "removeDimensions"] })
                        .data
                    : baseline[name];
              else
                svg =
                  kind === "svg"
                    ? componentsRaw[name]
                    : renderToStaticMarkup(createElement(component(name), { size }));
              svg = svg.replace(
                /<svg\b([^>]*)>/,
                (_root, attributes) =>
                  `<svg${attributes.replace(/\s(?:width|height)="[^"]*"/g, "")} width="${size}" height="${size}">`,
              );
              return `<div class="sample">${svg}</div>`;
            })
            .join("");
        // Raw package SVGs are independently optimized; React retains original source paths.
        const componentsRaw = Object.fromEntries(
          await Promise.all(
            manifest.map(async ({ name }) => [
              name,
              await readFile(new URL(`../dist/svg/${name}.svg`, import.meta.url), "utf8"),
            ]),
          ),
        );
        const html = (old) =>
          `<style>${sheetStyle}${css}#sheet{background:${dark ? "#101827" : "#fff"};color:${dark ? "#eee" : "#111"}}</style><div id="sheet">${sheet(old)}</div>`;
        await page.setContent(html(true));
        const original = await page.locator("#sheet").screenshot();
        await page.setContent(html(false));
        const current = await page.locator("#sheet").screenshot();
        assert(
          original.equals(current),
          `${kind} ${size}px ${dark ? "dark" : "light"}: resting screenshot changed`,
        );
        report.snapshots += 200;
      }
    }
  }
  report.checks.push("2400 browser resting snapshots: SVG + React, 16/24/48px, light + dark");

  // Custom timing must keep every animated part and visibility layer in sync.
  for (const animationType of ["default", "draw"]) {
    for (const animate of ["hover", "always"]) {
      for (const duration of [560, 240, 800, 0]) {
        const svg = renderToStaticMarkup(
          createElement(
            components.CareerIconsProvider,
            { animate, animationType, animationDuration: 800 },
            createElement(
              components.CareerIconsProvider,
              { animationDuration: 240 },
              createElement(components.ResumeIcon, { animationDuration: duration }),
            ),
          ),
        );
        await page.setContent(`<style>${css}</style><button class="ci-hover">${svg}</button>`);
        await page.keyboard.press("Tab");
        await page.locator("button").focus();
        const state = await page.locator("svg").evaluate(
          (svg, { duration, animate }) => {
            const animations = svg.getAnimations({ subtree: true });
            const timings = animations.map((animation) => animation.effect.getTiming().duration);
            for (const animation of animations) {
              animation.pause();
              animation.currentTime = duration * 0.4;
            }
            const active = getComputedStyle(svg.querySelector(".ci-motion")).visibility;
            for (const animation of animations) animation.currentTime = duration * 2;
            return {
              timings,
              active,
              rest: getComputedStyle(svg.querySelector(".ci-rest")).visibility,
              motion: getComputedStyle(svg.querySelector(".ci-motion")).visibility,
              expected: duration * (animate === "always" ? 3 : 1),
            };
          },
          { duration, animate },
        );
        if (duration > 0) {
          assert(state.timings.length > 2, "custom duration: missing animations");
          assert(
            state.timings.every((value) => Math.abs(value - state.expected) < 0.001),
            `custom duration: layers out of sync (${animationType}, ${animate}, ${duration}): ${state.timings}`,
          );
          assert.equal(state.active, "visible");
        }
        assert.equal(state.rest, "visible", "custom duration: rest frame missing at end/pause");
        assert.equal(state.motion, "hidden", "custom duration: motion visible at end/pause");
        await page.emulateMedia({ reducedMotion: "reduce" });
        assert.equal(await page.evaluate(() => document.getAnimations().length), 0);
        await page.emulateMedia({ reducedMotion: "no-preference" });
      }
    }
  }
  report.checks.push(
    "custom durations: provider/prop precedence, default + draw, hover + always, synchronized layers, zero and reduced motion",
  );

  const url = `http://127.0.0.1:${server.address().port}/docs/animations.html`;
  await page.goto(url, { waitUntil: "networkidle" });
  assert.equal(await page.locator("#gallery button").count(), 200);
  await page.addStyleTag({ content: "header{position:static!important}" });
  await page.mouse.move(0, 0);
  await page.selectOption("#mode", "none");
  const resting = await page.locator("#gallery").screenshot();
  await page.selectOption("#mode", "always");
  const animationState = await page.evaluate(
    ({ hoverDuration, loopDuration }) => {
      const entries = [];
      for (const svg of document.querySelectorAll("#gallery svg")) {
        const animations = svg.getAnimations({ subtree: true });
        for (const animation of animations) {
          animation.pause();
          animation.currentTime = 180;
        }
        const partAnimations = animations.filter(
          (animation) =>
            animation.effect.target.classList.contains("ci-motion") ||
            animation.effect.target.closest(".ci-motion"),
        );
        entries.push({
          name: svg.closest("button").dataset.icon,
          rootTransform: getComputedStyle(svg).transform,
          count: partAnimations.length,
          playing: partAnimations.map((animation) => ({
            name: animation.animationName,
            duration: animation.effect.getTiming().duration,
          })),
          partStates: [...svg.querySelectorAll(".ci-motion [data-ci-part]")].map((part) => ({
            part: part.dataset.ciPart,
            transform: getComputedStyle(part).transform,
            opacity: getComputedStyle(part).opacity,
            dash: getComputedStyle(part).strokeDashoffset,
          })),
          visible: getComputedStyle(svg.querySelector(".ci-motion") ?? svg).visibility,
        });
        // The last 1120ms of every 1680ms iteration must be exactly static.
        for (const animation of animations)
          animation.currentTime = hoverDuration + (loopDuration - hoverDuration) / 2;
      }
      return entries;
    },
    { hoverDuration, loopDuration },
  );
  for (const { name, rootTransform, count, playing, partStates, visible } of animationState) {
    const plan = animationPlan[name];
    assert.equal(rootTransform, "none", `${name}: whole SVG transform`);
    if (plan.motion === "none") {
      assert.equal(count, 0);
      report.static.push({ name, reason: plan.reason });
      continue;
    }
    assert.equal(count, plan.parts.length + 1, `${name}: missing live part animations`);
    assert.equal(visible, "visible", `${name}: motion layer not visible during cycle`);
    assert(
      playing.every((animation) => Math.abs(animation.duration - loopDuration) < 0.001),
      `${name}: wrong loop duration`,
    );
    assert(
      partStates.some(
        (part) =>
          (part.transform !== "matrix(1, 0, 0, 1, 0, 0)" && part.transform !== "none") ||
          Number(part.opacity) < 1 ||
          Number(part.dash) !== 0,
      ),
      `${name}: motion has no observable part change`,
    );
    report.animated++;
  }
  assert(
    resting.equals(await page.locator("#gallery").screenshot()),
    "always pause differs from resting frame",
  );
  report.checks.push(
    "196 live part motions; root transforms absent; 1120ms loop pause matches static frame",
  );

  // Endpoints, cancellation and focus/ancestor triggers are checked for every animated icon.
  await page.selectOption("#mode", "hover");
  for (const { name, animation } of manifest) {
    if (animation === "none") continue;
    const button = page.locator(`[data-icon="${name}"]`);
    await button.focus();
    const focused = await button.evaluate((node) => {
      const svg = node.querySelector("svg");
      const motions = svg.getAnimations({ subtree: true });
      const enabled = motions.length;
      for (const motion of motions) {
        motion.pause();
        motion.currentTime = 560;
      }
      return {
        enabled,
        rest: getComputedStyle(svg.querySelector(".ci-rest")).visibility,
        motion: getComputedStyle(svg.querySelector(".ci-motion")).visibility,
      };
    });
    assert(
      focused.enabled >= animationPlan[name].parts.length + 2,
      `${name}: focus-visible does not trigger all parts`,
    );
    assert.equal(focused.rest, "visible");
    assert.equal(focused.motion, "hidden");
    await button.evaluate((node) => node.blur());
    await button.hover();
    assert(
      await button.evaluate(
        (node) => node.querySelector("svg").getAnimations({ subtree: true }).length > 0,
      ),
      `${name}: hover did not trigger`,
    );
    await page.mouse.move(0, 0);
    await button.evaluate((node) => node.blur());
    assert.equal(
      await button.evaluate(
        (node) => node.querySelector("svg").getAnimations({ subtree: true }).length,
      ),
      0,
      `${name}: hover cancellation left motion active`,
    );
  }
  report.checks.push("all 196 hover/focus triggers, endpoints and cancellation");

  const first = page.locator('[data-icon="resume-check"]');
  await first.evaluate((node) => {
    const svg = node.querySelector("svg");
    svg.setAttribute("tabindex", "0");
    svg.focus();
  });
  assert(
    await first.locator("svg").evaluate((svg) => svg.getAnimations({ subtree: true }).length > 0),
    "direct SVG focus trigger",
  );
  await first.evaluate((node) => {
    const input = document.createElement("input");
    node.append(input);
    input.focus();
  });
  assert(
    await first.locator("svg").evaluate((svg) => svg.getAnimations({ subtree: true }).length > 0),
    "ancestor descendant focus trigger",
  );
  await first.evaluate((node) => {
    node.querySelector("input").remove();
    node.querySelector("svg").removeAttribute("tabindex");
  });
  report.checks.push("direct SVG and ancestor descendant focus-visible triggers");

  await page.selectOption("#mode", "always");
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(
    await page.evaluate(() => document.getAnimations().length),
    0,
    "system reduced motion still animates",
  );
  assert(
    resting.equals(await page.locator("#gallery").screenshot()),
    "system reduced-motion frame changed",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.check("#reduced");
  assert.equal(
    await page.evaluate(() => document.getAnimations().length),
    0,
    "demo reduced toggle still animates",
  );
  assert(
    resting.equals(await page.locator("#gallery").screenshot()),
    "demo reduced-motion frame changed",
  );
  report.checks.push("OS reduced-motion and demo reduced-motion toggles disable all motion");

  await page.uncheck("#reduced");
  await page.selectOption("#type", "draw");
  await page.selectOption("#mode", "none");
  await page.mouse.move(0, 0);
  const drawResting = await page.locator("#gallery").screenshot();
  await page.selectOption("#mode", "always");
  const sampleCollection = async (time) =>
    page.evaluate((currentTime) => {
      return [...document.querySelectorAll("#gallery svg")].map((svg) => {
        const animations = svg.getAnimations({ subtree: true });
        for (const animation of animations) {
          animation.pause();
          animation.currentTime = currentTime;
        }
        return {
          name: svg.closest("button").dataset.icon,
          names: animations.map((animation) => animation.animationName),
          rootTransform: getComputedStyle(svg).transform,
          rest: getComputedStyle(svg.querySelector(".ci-rest")).visibility,
          motion: getComputedStyle(svg.querySelector(".ci-motion")).visibility,
          parts: [
            ...svg.querySelectorAll(
              ".ci-motion path,.ci-motion circle,.ci-motion rect,.ci-motion line,.ci-motion polyline,.ci-motion polygon",
            ),
          ].map((part) => ({
            opacity: Number(getComputedStyle(part).opacity),
            offset: Number.parseFloat(
              getComputedStyle(part).strokeDashoffset.replace(/^calc\(/, ""),
            ),
            dash: getComputedStyle(part).strokeDasharray,
          })),
        };
      });
    }, time);
  for (const state of await sampleCollection(6)) {
    assert.equal(
      state.names.length,
      drawPlan[state.name].length + 2,
      `${state.name}: draw animation coverage`,
    );
    assert(
      state.names.every((name) => name.startsWith("ci-draw-")),
      `${state.name}: semantic motion also runs during drawing`,
    );
    assert.equal(state.rootTransform, "none");
    assert.equal(state.rest, "hidden");
    assert.equal(state.motion, "visible");
    assert(
      state.parts.every((part) => part.opacity === 0),
      `${state.name}: draw does not start empty`,
    );
  }
  for (const state of await sampleCollection(210)) {
    const first = state.parts[0];
    const spec = drawPlan[state.name][0];
    if (spec.dotted) {
      assert(first.opacity > 0 && first.opacity < 1, "ghosted: dotted reveal is not progressive");
      assert.equal(first.dash, "1px, 4px", "ghosted: original dash pattern changed");
    } else
      assert(
        first.offset > 0 && first.offset < spec.length,
        `${state.name}: first stroke is not progressively drawing`,
      );
  }
  for (const state of await sampleCollection(520)) {
    const last = state.parts.at(-1);
    const spec = drawPlan[state.name].at(-1);
    if (!spec.dotted)
      assert(
        last.offset > 0 && last.offset < spec.length,
        `${state.name}: last stroke is not progressively drawing`,
      );
  }
  // Verify the actual completed motion layer before the pristine resting
  // layer takes over; checking only the pause can hide missing draw strokes.
  for (const state of await sampleCollection(548)) {
    assert.equal(state.rest, "hidden", `${state.name}: completed draw masked by rest layer`);
    assert.equal(state.motion, "visible");
    for (const [index, part] of state.parts.entries()) {
      assert.equal(part.opacity, 1, `${state.name}: stroke ${index} never finishes revealing`);
      if (!drawPlan[state.name][index].dotted) {
        assert.equal(part.offset, 0, `${state.name}: stroke ${index} never finishes drawing`);
        assert.equal(part.dash, "none", `${state.name}: completed stroke retains a gap`);
      }
    }
  }
  // Isolate artwork from the demo's translucent text and compositing layers.
  const drawPage = await browser.newPage({ viewport: { width: 1040, height: 800 } });
  const drawSvgs = await page.evaluate(() =>
    [...document.querySelectorAll("#gallery svg")].map((svg) => svg.outerHTML),
  );
  for (const kind of ["svg", "react"]) {
    for (const size of [16, 24, 48]) {
      const sheet = manifest
        .map(({ name }, index) => {
          const svg =
            kind === "svg"
              ? drawSvgs[index].replace(/(?:width|height)="\d+"/g, (attribute) =>
                  attribute.replace(/\d+/, size),
                )
              : renderToStaticMarkup(
                  createElement(component(name), {
                    size,
                    animate: "always",
                    animationType: "draw",
                  }),
                );
          return `<div class="sample">${svg}</div>`;
        })
        .join("");
      await drawPage.setContent(`<style>${sheetStyle}${css}</style><div id="sheet">${sheet}</div>`);
      await drawPage.evaluate(() => {
        for (const animation of document.getAnimations()) {
          animation.pause();
          animation.currentTime = 548;
        }
      });
      const completedDraw = await drawPage.locator("#sheet").screenshot();
      await drawPage.addStyleTag({
        content:
          ".ci-motion :is(path,circle,rect,line,polyline,polygon){opacity:1!important;stroke-dashoffset:0!important}.ci-motion :is(path,circle,rect,line,polyline,polygon):not([stroke-dasharray]){stroke-dasharray:none!important}",
      });
      assert(
        completedDraw.equals(await drawPage.locator("#sheet").screenshot()),
        `${kind} ${size}px: completed motion layer differs from fully drawn geometry`,
      );
    }
  }
  await drawPage.close();
  report.drawCompletionSnapshots = 1200;
  report.checks.push(
    "1200 completed draw-layer snapshots: SVG + React, 16/24/48px, before returning to rest",
  );
  await sampleCollection(1120);
  assert(
    drawResting.equals(await page.locator("#gallery").screenshot()),
    "full collection draw loop pause differs from static pixels",
  );
  await page.selectOption("#mode", "hover");
  await page.keyboard.press("Tab");
  for (const { name } of manifest) {
    const button = page.locator(`[data-icon="${name}"]`);
    await button.focus();
    const endpoints = await button.evaluate((node) => {
      const svg = node.querySelector("svg");
      const animations = svg.getAnimations({ subtree: true });
      const count = animations.length;
      for (const animation of animations) {
        animation.pause();
        animation.currentTime = 560;
      }
      return {
        count,
        rest: getComputedStyle(svg.querySelector(".ci-rest")).visibility,
        motion: getComputedStyle(svg.querySelector(".ci-motion")).visibility,
      };
    });
    assert.equal(endpoints.count, drawPlan[name].length + 2, `${name}: draw focus trigger`);
    assert.equal(endpoints.rest, "visible");
    assert.equal(endpoints.motion, "hidden");
    const restarted = await button.evaluate((node) => {
      const svg = node.querySelector("svg");
      svg.removeAttribute("data-ci-animation-type");
      getComputedStyle(svg.querySelector(".ci-rest")).animationName;
      svg.setAttribute("data-ci-animation-type", "draw");
      const animations = svg.getAnimations({ subtree: true });
      for (const animation of animations) {
        animation.pause();
        animation.currentTime = 6;
      }
      return getComputedStyle(svg.querySelector(".ci-rest")).visibility;
    });
    assert.equal(
      restarted,
      "hidden",
      `${name}: switching animationType during focus did not restart drawing`,
    );
    await button.evaluate((node) => node.blur());
    await button.hover();
    assert.equal(
      await button.evaluate(
        (node) => node.querySelector("svg").getAnimations({ subtree: true }).length,
      ),
      drawPlan[name].length + 2,
      `${name}: draw hover trigger`,
    );
    await page.mouse.move(0, 0);
    await button.evaluate((node) => node.blur());
    assert.equal(
      await button.evaluate(
        (node) => node.querySelector("svg").getAnimations({ subtree: true }).length,
      ),
      0,
      `${name}: draw cancellation`,
    );
  }
  await page.selectOption("#mode", "always");
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(await page.evaluate(() => document.getAnimations().length), 0);
  assert(
    drawResting.equals(await page.locator("#gallery").screenshot()),
    "draw system reduced-motion pixels changed",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.check("#reduced");
  assert.equal(await page.evaluate(() => document.getAnimations().length), 0);
  assert(
    drawResting.equals(await page.locator("#gallery").screenshot()),
    "draw demo reduced-motion pixels changed",
  );
  report.drawIcons = 200;
  report.checks.push(
    "all 200 draw animations: empty start, progressive first/last strokes, hover/focus, type switching, cancellation, exact loop pause and reduced-motion pixels",
  );
  report.checks.push("ghosted draw preserves the original dotted outline");
  assert.deepEqual(errors, [], "demo runtime errors");
  await mkdir(new URL("../docs/previews/", import.meta.url), { recursive: true });
  await writeFile(
    new URL("../docs/previews/animation-checks.json", import.meta.url),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser?.close();
  await new Promise((resolveClose) => server.close(resolveClose));
}
