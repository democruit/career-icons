import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { Resvg } from "@resvg/resvg-js";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { optimize } from "svgo";
import { afterAll, beforeAll, expect, test } from "vitest";
import { animationPlan } from "../scripts/animation-plan.mjs";
import {
  effects,
  generateAnimationsCss,
  hoverDuration,
  loopDuration,
} from "../scripts/animations.mjs";
import { buildIcons } from "../scripts/build.mjs";
import { drawPlan } from "../scripts/draw-plan.mjs";

const require = createRequire(import.meta.url);
const baseline = JSON.parse(
  await readFile(new URL("./fixtures/static-0.2.0.json", import.meta.url), "utf8"),
);
let output;
let components;
let collection;

beforeAll(async () => {
  output = await mkdtemp(join(tmpdir(), "career-icons-css-"));
  collection = await buildIcons(output);
  const code = await readFile(join(output, "react/index.cjs"), "utf8");
  components = {};
  new Function("require", "exports", code)(require, components);
});
afterAll(async () => {
  await rm(output, { recursive: true, force: true });
});

function pixels(svg, size) {
  return new Resvg(svg, {
    font: { loadSystemFonts: false },
    fitTo: { mode: "width", value: size },
  }).render().pixels;
}

test("all 200 icons have motion parts or a matching explicit static reason", () => {
  expect(Object.keys(animationPlan)).toHaveLength(200);
  for (const { metadata, svg, componentName } of collection) {
    const plan = animationPlan[metadata.name];
    expect(metadata.animation).toBe(plan.motion);
    expect(svg).toContain(`class="ci-${metadata.name}"`);
    const react = renderToStaticMarkup(
      createElement(components[componentName], { className: "consumer", animate: "hover" }),
    );
    expect(react).toContain(`class="ci-${metadata.name} consumer"`);
    for (const { part, effect } of plan.parts) {
      expect(effects[effect]).toBeDefined();
      expect(svg).toContain(`class="ci-part-${part}"`);
      expect(react).toContain(`class="ci-part-${part}"`);
    }
    if (plan.motion === "none") {
      expect(plan.parts).toHaveLength(0);
      expect(metadata.animationReason).toBe(plan.reason);
      expect(plan.reason.length).toBeGreaterThan(20);
    } else {
      expect(plan.parts.length).toBeGreaterThan(0);
      expect(svg).toContain('class="ci-motion"');
      expect(svg).toContain('display="none"');
    }
  }
});

test("source, optimized SVG and React resting pixels match the captured 0.2.0 artwork at 16/24/48px", async () => {
  for (const { metadata, svg, componentName } of collection) {
    const original = baseline[metadata.name];
    const source = await readFile(
      new URL(`../icons/${metadata.name}.svg`, import.meta.url),
      "utf8",
    );
    const oldOptimized = optimize(original, {
      plugins: ["preset-default", "removeDimensions"],
    }).data;
    const react = renderToStaticMarkup(createElement(components[componentName]));
    for (const size of [16, 24, 48]) {
      expect(
        pixels(source, size).equals(pixels(original, size)),
        `${metadata.name} source ${size}`,
      ).toBe(true);
      expect(
        pixels(svg, size).equals(pixels(oldOptimized, size)),
        `${metadata.name} optimized ${size}`,
      ).toBe(true);
      expect(
        pixels(react, size).equals(pixels(original, size)),
        `${metadata.name} React ${size}`,
      ).toBe(true);
    }
    expect(react).not.toContain("data-ci-animate");
  }
});

test("CSS is generated, opt-in, namespaced, keyboard accessible and below 40KB gzip", async () => {
  const css = await readFile(join(output, "animations.css"), "utf8");
  expect(css).toBe(generateAnimationsCss());
  expect(css).toBe(await readFile(new URL("../src/animations.css", import.meta.url), "utf8"));
  expect(css).toContain('[data-ci-animate="hover"]:is(:hover,:focus-visible)');
  expect(css).toContain(".ci-hover:is(:hover,:focus-visible,:has(:focus-visible))");
  expect(css).toContain('[data-ci-animate="always"]');
  expect(css).toContain("prefers-reduced-motion:reduce");
  expect(css).toContain("prefers-reduced-motion:no-preference");
  expect(css).toContain("transform-box:fill-box");
  expect(css).not.toMatch(/scale\(|animation-fill-mode:|\bboth\b/);
  expect(css).not.toMatch(/(?:^|[;{])(?:stroke-width|stroke|fill):/);
  expect(hoverDuration).toBeGreaterThanOrEqual(300);
  expect(hoverDuration).toBeLessThanOrEqual(600);
  expect(loopDuration - hoverDuration).toBeGreaterThanOrEqual(hoverDuration);
  for (const [name, { parts }] of Object.entries(animationPlan)) {
    for (const { part } of parts) expect(css).toContain(`@keyframes ci-${name}-${part}{`);
  }
  expect(gzipSync(css).length).toBeLessThan(40 * 1024);
});

test("motion endpoints restore the rest state and transforms respect amplitude limits", () => {
  for (const frames of Object.values(effects)) {
    expect(frames[0][0]).toBe(0);
    expect(frames.at(-1)[0]).toBe(100);
    expect(frames[0][1]).toBe(frames.at(-1)[1]);
    for (const [, declarations] of frames) {
      for (const match of declarations.matchAll(/rotate(?:X|Y)?\((-?[\d.]+)deg\)/g))
        expect(Math.abs(Number(match[1]))).toBeLessThanOrEqual(15);
      for (const match of declarations.matchAll(/translate(?:X|Y)?\(([^)]+)\)/g)) {
        const values = match[1].split(",").map((value) => Number.parseFloat(value));
        expect(Math.hypot(...values)).toBeLessThanOrEqual(2);
      }
    }
  }
});

test("all 200 icons draw every visible shape with measured stroke lengths", async () => {
  const css = await readFile(join(output, "animations.css"), "utf8");
  expect(Object.keys(drawPlan)).toHaveLength(200);
  for (const { metadata, tree, svg } of collection) {
    const shapes = [];
    function walk(nodes) {
      for (const node of nodes) {
        if (node.g) walk(node.g);
        else shapes.push(node[":@"]);
      }
    }
    walk(tree.svg.find((node) => node[":@"].class === "ci-motion").g);
    const parts = drawPlan[metadata.name];
    expect(shapes).toHaveLength(parts.length);
    for (const [index, part] of parts.entries()) {
      expect(shapes[index].class).toBe(part.target);
      expect(svg).toContain(`class="${part.target}"`);
      expect(part.length).toBeGreaterThan(0);
      if (!part.dotted && shapes[index].d)
        expect(
          shapes[index].d.match(/[Mm]/g),
          `${metadata.name}: disconnected draw stroke`,
        ).toHaveLength(1);
      if (shapes[index].r) {
        const circumference = 2 * Math.PI * Number(shapes[index].r);
        expect(part.length, `${metadata.name}: incomplete circle`).toBeGreaterThanOrEqual(
          circumference,
        );
        expect(part.length).toBeLessThan(circumference + 0.02);
      }
      expect(part.end).toBeLessThanOrEqual(96);
      expect(css).toContain(
        `.ci-${metadata.name} .ci-motion .${part.target}{--ci-length:${part.length}`,
      );
    }
  }
  expect(drawPlan.ghosted[0].dotted).toBe(true);
  expect(drawPlan.promotion).toHaveLength(3);
  expect(drawPlan["team-meeting"]).toHaveLength(7);
  expect(drawPlan["team-meeting"][4].length).toBeCloseTo(14 + 4 * Math.PI, 1);
});
