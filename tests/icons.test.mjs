import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { build as bundle } from "esbuild";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, expect, test } from "vitest";
import { buildIcons } from "../scripts/build.mjs";
import { animations, assertPaintBounds, loadIcons, parseSvg } from "../scripts/icons.mjs";
import { searchIcons } from "../site/src/catalog.mjs";

const pilot = ["ats-pass", "laid-off", "resume", "salary-range", "video-interview"];
const additions = JSON.parse(
  await readFile(new URL("../scripts/collection-0.2.0.json", import.meta.url)),
);
const original = JSON.parse(
  await readFile(new URL("../scripts/collection-0.1.0.json", import.meta.url)),
);
const approved = {
  resume:
    "resume resume-edit resume-check resume-upload resume-download resume-template cover-letter portfolio",
  ats: "ats-pass ats-scan ats-reject keyword-match parse-error ats-score",
  applications:
    "job-post job-search apply application-tracker saved-job easy-apply ghosted waiting-reply follow-up",
  interviews:
    "video-interview interview phone-screen ai-interviewer interview-prep interview-schedule tell-me-about-yourself mock-interview feedback",
  "offers-salary":
    "salary-range job-offer offer-accepted salary negotiation pay-transparency benefits equity",
  "layoffs-transition":
    "laid-off open-to-work severance unemployment-benefits career-change warn-notice seven-day-plan",
  networking: "referral network recruiter linkedin-profile",
  "remote-work": "remote-job hybrid relocation",
  "career-growth": "promotion skills certificate career-goal learning",
  tools: "job-tracker",
};
const require = createRequire(import.meta.url);
let output;
let built;

beforeAll(async () => {
  output = await mkdtemp(join(tmpdir(), "career-icons-test-"));
  built = await buildIcons(output);
});
afterAll(async () => {
  await rm(output, { recursive: true, force: true });
});

test("collection includes the pilot and final icons with useful search metadata", async () => {
  const icons = await loadIcons();
  const names = Object.values(approved)
    .flatMap((list) => list.split(" "))
    .sort();
  expect(icons).toHaveLength(200);
  expect(icons.map(({ metadata }) => metadata.name)).toEqual(
    [...names, ...Object.values(additions).flat()].sort(),
  );
  for (const metadata of original) {
    expect(icons.find((icon) => icon.metadata.name === metadata.name)?.metadata).toEqual(metadata);
  }
  for (const [category, list] of Object.entries(approved)) {
    expect(
      icons
        .filter(({ metadata }) => metadata.category === category && metadata.since === "0.1.0")
        .map(({ metadata }) => metadata.name),
    ).toEqual(list.split(" ").sort());
  }
  expect(icons.map(({ metadata }) => metadata.name)).toEqual(expect.arrayContaining(pilot));
  for (const { metadata } of icons) {
    expect(metadata.placeholder).toBeUndefined();
    expect(metadata.tags.length).toBeGreaterThanOrEqual(4);
    expect(metadata.tags.length).toBeLessThanOrEqual(8);
    expect(metadata.since).toBe(names.includes(metadata.name) ? "0.1.0" : "0.2.0");
    if (!names.includes(metadata.name)) {
      expect(additions[metadata.category]).toContain(metadata.name);
      expect(metadata.animation).toBe("none");
    }
  }
});

test("all 200 geometries are distinct, minimal and honestly describe their animated parts", () => {
  const geometry = built.map(({ svg }) => svg.replace(/\sdata-ci-part="[^"]*"/g, ""));
  expect(new Set(geometry).size).toBe(200);
  for (const { metadata, tree, svg } of built) {
    const count = (nodes) =>
      nodes.reduce((total, node) => {
        const tag = Object.keys(node).find((key) => key !== ":@");
        return total + (tag === "g" ? count(node.g) : 1);
      }, 0);
    expect(count(tree.svg), metadata.name).toBeLessThanOrEqual(6);
    expect(svg.includes("data-ci-part"), metadata.name).toBe(metadata.animation !== "none");
  }
});

test("validator rejects forbidden artwork and wrong root stroke", async () => {
  const svg = await readFile(new URL("../icons/resume.svg", import.meta.url), "utf8");
  expect(() => parseSvg(svg.replace('stroke-width="2"', 'stroke-width="1"'))).toThrow(
    "stroke-width",
  );
  expect(() => parseSvg(svg.replace("</svg>", '<text x="5" y="5">CV</text></svg>'))).toThrow(
    "Forbidden element",
  );
  expect(() => parseSvg(svg.replace("<rect ", '<rect style="fill:red" '))).toThrow(
    "Forbidden attribute",
  );
  expect(() => parseSvg(svg.replace("<rect ", '<rect id="photo" '))).toThrow("Forbidden attribute");
  for (const attribute of ['fill="red"', 'stroke="#000"', 'transform="translate(1 1)"']) {
    expect(() => parseSvg(svg.replace("<rect ", `<rect ${attribute} `))).toThrow(
      "Forbidden attribute",
    );
  }
  expect(() =>
    parseSvg(svg.replace("</svg>", '<image href="data:image/png;base64,AA=="/></svg>')),
  ).toThrow("Forbidden element");
});

test("padding audit catches painted strokes, even beyond the original viewport", async () => {
  const svg = await readFile(new URL("../icons/resume.svg", import.meta.url), "utf8");
  expect(() => assertPaintBounds(svg)).not.toThrow();
  expect(() =>
    assertPaintBounds(svg.replace("</svg>", '<circle cx="23" cy="12" r="2"/></svg>')),
  ).toThrow("Paint exceeds");
  expect(() =>
    assertPaintBounds(svg.replace("</svg>", '<circle cx="300" cy="12" r="2"/></svg>')),
  ).toThrow("Paint exceeds");
});

test("pilot icons declare animations and part attributes the validator accepts", async () => {
  const expected = {
    resume: { animation: "draw", part: "lines" },
    "ats-pass": { animation: "draw-check", part: "check" },
    "video-interview": { animation: "pop", part: "person" },
    "salary-range": { animation: "slide", part: "handle-left" },
    "laid-off": { animation: "wiggle", part: "box" },
  };
  const icons = (await loadIcons()).filter(({ metadata }) => pilot.includes(metadata.name));
  for (const { metadata, svg } of icons) {
    expect(animations.has(metadata.animation)).toBe(true);
    expect(metadata.animation).toBe(expected[metadata.name].animation);
    expect(svg).toContain(`data-ci-part="${expected[metadata.name].part}"`);
  }
  expect(icons.find(({ metadata }) => metadata.name === "salary-range")?.svg).toContain(
    'data-ci-part="handle-right"',
  );
  const svg = await readFile(new URL("../icons/resume.svg", import.meta.url), "utf8");
  expect(() => parseSvg(svg.replace('data-ci-part="lines"', 'data-ci-part="Lines"'))).toThrow(
    "Forbidden attribute",
  );
  expect(() => parseSvg(svg.replace("data-ci-part", "data-id"))).toThrow("Forbidden attribute");
});

test("metadata rejects an unknown animation name", async () => {
  const directory = await mkdtemp(join(tmpdir(), "career-icons-animation-"));
  try {
    const svg = await readFile(new URL("../icons/resume.svg", import.meta.url), "utf8");
    const metadata = { ...(await loadIcons())[0].metadata };
    await writeFile(join(directory, "sample.svg"), svg);
    await writeFile(
      join(directory, "sample.json"),
      JSON.stringify({ ...metadata, name: "sample", aliases: [], animation: "bounce" }),
    );
    await expect(loadIcons(directory)).rejects.toThrow("invalid animation");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("metadata rejects duplicate aliases across icons", async () => {
  const directory = await mkdtemp(join(tmpdir(), "career-icons-invalid-"));
  try {
    const svg = await readFile(new URL("../icons/resume.svg", import.meta.url), "utf8");
    const metadata = built[0].metadata;
    for (const name of ["sample-one", "sample-two"]) {
      await writeFile(join(directory, `${name}.svg`), svg);
      await writeFile(
        join(directory, `${name}.json`),
        JSON.stringify({ ...metadata, name, aliases: ["same-alias"] }),
      );
    }
    await expect(loadIcons(directory)).rejects.toThrow("alias collision");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("build emits matching raw exports, SVG files, manifest and sprite", async () => {
  const rootPkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  const pkg = require(join(output, "index.cjs"));
  const manifest = JSON.parse(await readFile(join(output, "icons.json"), "utf8"));
  expect(pkg.version).toBe(rootPkg.version);
  expect(manifest.map(({ name }) => name)).toEqual(built.map(({ metadata }) => metadata.name));
  expect(pkg.icons.map(({ name }) => name)).toEqual(built.map(({ metadata }) => metadata.name));
  const sprite = await readFile(join(output, "sprite.svg"), "utf8");
  expect((sprite.match(/<symbol /g) ?? []).length).toBe(built.length);
  expect(sprite).not.toContain("-alt");
  const esm = await readFile(join(output, "index.js"), "utf8");
  expect(esm).toContain(`export const version = ${JSON.stringify(rootPkg.version)};`);
  const types = await readFile(join(output, "index.d.ts"), "utf8");
  expect(types).toContain("export declare const version: string;");
  for (const { metadata, componentName, svg } of built) {
    expect(pkg[componentName]).toBe(svg);
    expect((await readFile(join(output, `svg/${metadata.name}.svg`), "utf8")).trim()).toBe(svg);
    expect(esm).toContain(`export const ${componentName} = ${JSON.stringify(svg)};`);
    expect(sprite).toContain(`id="${metadata.name}"`);
  }
});

test("React icons keep stroke currentColor and let the color prop override inherited color", () => {
  const code = require("node:fs").readFileSync(join(output, "react/index.cjs"), "utf8");
  const icons = {};
  new Function("require", "exports", code)(require, icons);
  for (const { componentName, svg } of built) {
    expect(svg).toContain('stroke="currentColor"');
    expect(svg).not.toMatch(/stroke="(?!currentColor)[^"]+"/);
    const html = renderToStaticMarkup(
      createElement(icons[componentName], {
        width: 16,
        height: 16,
        color: "navy",
        "aria-label": "Preview",
      }),
    );
    expect(html).toContain("<svg");
    expect(html).toContain('viewBox="0 0 24 24"');
    expect(html).toContain('width="16"');
    expect(html).toContain('height="16"');
    expect(html).toContain('stroke="currentColor"');
    expect(html).toContain('color="navy"');
    expect(html).not.toContain('stroke="navy"');
    expect(html).toContain('aria-label="Preview"');
  }
});

test("named raw and React imports discard the other 199 icons", async () => {
  for (const entry of ["index.js", "react/index.js"]) {
    const result = await bundle({
      stdin: {
        contents: `import { ResumeTailorIcon } from ${JSON.stringify(join(output, entry))}; console.log(ResumeTailorIcon);`,
        resolveDir: output,
      },
      bundle: true,
      write: false,
      minify: true,
      format: "esm",
      external: ["react"],
    });
    const code = result.outputFiles[0].text;
    expect(code).toContain("svg");
    expect(code).not.toContain("ResumeCompareIcon");
    expect(code).not.toContain("MentalHealthIcon");
    expect(code).not.toContain("accessibility");
    expect(Buffer.byteLength(code)).toBeLessThan(entry === "index.js" ? 1024 : 2500);
  }
});

test("catalog finds every icon by name, title, tags and aliases in its category", () => {
  const collection = built.map(({ metadata }) => metadata);
  expect(new Set(collection.map(({ category }) => category)).size).toBe(14);
  expect(searchIcons(collection, "")).toHaveLength(200);
  for (const metadata of collection) {
    for (const query of [metadata.name, metadata.title, ...metadata.tags, ...metadata.aliases]) {
      expect(searchIcons(collection, query, metadata.category)).toContain(metadata);
    }
  }
  expect(searchIcons(collection, "resume-score").map(({ name }) => name)).toEqual([
    "ats-score",
    "resume-score",
  ]);
  expect(searchIcons(collection, "interview-feedback").map(({ name }) => name)).toEqual([
    "feedback",
    "interview-feedback",
  ]);
});
