import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, expect, test } from "vitest";
import { buildIcons } from "../scripts/build.mjs";

const require = createRequire(import.meta.url);
let output;
let icons;

function markup(node) {
  return renderToStaticMarkup(node);
}

function attr(html, name) {
  const match = html.match(new RegExp(`(?:^|[\\s>])${name}="([^"]*)"`));
  return match?.[1];
}

beforeAll(async () => {
  output = await mkdtemp(join(tmpdir(), "career-icons-react-"));
  await buildIcons(output);
  const code = await readFile(join(output, "react/index.cjs"), "utf8");
  icons = {};
  new Function("require", "exports", code)(require, icons);
});

afterAll(async () => {
  await rm(output, { recursive: true, force: true });
});

test("a colored button inherits into the icon until the color prop overrides it", () => {
  const inherited = markup(
    createElement(
      "button",
      { type: "button", style: { color: "#2563EB" } },
      createElement(icons.ResumeIcon, { "aria-hidden": "true" }),
      "Save resume",
    ),
  );
  expect(inherited).toMatch(/color:\s*#2563EB/i);
  expect(inherited).toContain('stroke="currentColor"');
  expect(inherited).toContain('color="currentColor"');

  const overridden = markup(createElement(icons.ResumeIcon, { color: "#111827" }));
  expect(overridden).toContain('color="#111827"');
  expect(overridden).toContain('stroke="currentColor"');
  expect(overridden).not.toContain('stroke="#111827"');
});

test("icon props beat the provider, which beats the built-in defaults", () => {
  const defaults = markup(createElement(icons.ResumeIcon));
  expect(attr(defaults, "width")).toBe("24");
  expect(attr(defaults, "height")).toBe("24");
  expect(attr(defaults, "stroke-width")).toBe("1.5");
  expect(attr(defaults, "color")).toBe("currentColor");
  expect(defaults).not.toContain("data-ci-animate");

  const provided = markup(
    createElement(
      icons.CareerIconsProvider,
      { size: 40, strokeWidth: 3, color: "#111111", animate: "hover" },
      createElement(icons.AtsPassIcon),
    ),
  );
  expect(attr(provided, "width")).toBe("40");
  expect(attr(provided, "stroke-width")).toBe("3");
  expect(attr(provided, "color")).toBe("#111111");
  expect(attr(provided, "data-ci-animate")).toBe("hover");

  const overridden = markup(
    createElement(
      icons.CareerIconsProvider,
      {
        size: 40,
        strokeWidth: 3,
        color: "#111111",
        animate: "always",
        absoluteStrokeWidth: true,
      },
      createElement(icons.SalaryRangeIcon, {
        size: 16,
        color: "red",
        animate: "none",
        absoluteStrokeWidth: false,
      }),
    ),
  );
  expect(attr(overridden, "width")).toBe("16");
  expect(attr(overridden, "stroke-width")).toBe("3");
  expect(attr(overridden, "color")).toBe("red");
  expect(overridden).not.toContain("data-ci-animate");
  expect(overridden).toContain('stroke="currentColor"');
});

test("absoluteStrokeWidth keeps the visual stroke constant and can be set by the provider", () => {
  const html = markup(
    createElement(
      icons.CareerIconsProvider,
      { size: 48, absoluteStrokeWidth: true },
      createElement(icons.VideoInterviewIcon),
    ),
  );
  expect(attr(html, "width")).toBe("48");
  expect(attr(html, "stroke-width")).toBe("0.75");

  const explicit = markup(
    createElement(icons.ResumeIcon, { size: 32, strokeWidth: 1.5, absoluteStrokeWidth: true }),
  );
  expect(attr(explicit, "stroke-width")).toBe("1.125");
});
