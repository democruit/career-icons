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
      playing.every((animation) => animation.duration === loopDuration),
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
