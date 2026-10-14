import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, expect, test } from "vitest";
import { buildIcons } from "../scripts/build.mjs";

const require = createRequire(import.meta.url);
let output;
let icons;

beforeAll(async () => {
  output = await mkdtemp(join(tmpdir(), "career-icons-css-"));
  await buildIcons(output);
  const code = await readFile(join(output, "react/index.cjs"), "utf8");
  icons = {};
  new Function("require", "exports", code)(require, icons);
});

afterAll(async () => {
  await rm(output, { recursive: true, force: true });
});

test("animations.css is opt-in, targets pilot parts, and stays under 3 KB gzip", async () => {
  const css = await readFile(join(output, "animations.css"), "utf8");
  const source = await readFile(new URL("../src/animations.css", import.meta.url), "utf8");
  expect(css).toBe(source);
  for (const part of ["lines", "check", "person", "handle-left", "handle-right", "box"]) {
    expect(css).toContain(`[data-ci-part="${part}"]`);
  }
  expect(css).toContain('[data-ci-animate="hover"]:hover');
  expect(css).toContain(".ci-hover:hover");
  expect(css).toContain('[data-ci-animate="always"]');
  expect(css).toContain("prefers-reduced-motion: reduce");
  expect(css).toContain("prefers-reduced-motion: no-preference");
  expect(css).toContain("transform-box: fill-box");
  expect(gzipSync(css).length).toBeLessThan(3072);

  const staticIcon = renderToStaticMarkup(createElement(icons.ResumeIcon));
  expect(staticIcon).toContain('data-ci-part="lines"');
  expect(staticIcon).not.toContain("data-ci-animate");

  const playing = renderToStaticMarkup(createElement(icons.LaidOffIcon, { animate: "always" }));
  expect(playing).toContain('data-ci-animate="always"');
  expect(playing).toContain('data-ci-part="box"');
});
