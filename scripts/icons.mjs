import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import { optimize } from "svgo";
import { animationPlan } from "./animation-plan.mjs";

export const iconDirectory = fileURLToPath(new URL("../icons/", import.meta.url));
const categories = new Set([
  "resume",
  "ats",
  "applications",
  "interviews",
  "offers-salary",
  "layoffs-transition",
  "networking",
  "remote-work",
  "career-growth",
  "tools",
  "job-types",
  "workplace",
  "industries",
  "inclusion",
]);
const kebab = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const animations = new Set(Object.values(animationPlan).map(({ motion }) => motion));
const semver =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[\da-zA-Z-]+(?:\.[\da-zA-Z-]+)*)?(?:\+[\da-zA-Z-]+(?:\.[\da-zA-Z-]+)*)?$/;
const roots = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
};
const attributes = {
  svg: new Set([...Object.keys(roots), "xmlns", "class"]),
  path: new Set(["d", "stroke-dasharray"]),
  circle: new Set(["cx", "cy", "r"]),
  rect: new Set(["x", "y", "width", "height", "rx", "ry"]),
  line: new Set(["x1", "y1", "x2", "y2"]),
  polyline: new Set(["points"]),
  polygon: new Set(["points"]),
  g: new Set(["display"]),
};
const parser = new XMLParser({
  preserveOrder: true,
  ignoreAttributes: false,
  attributeNamePrefix: "",
  trimValues: true,
});

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function parseSvg(svg) {
  assert(!/<[!?]/.test(svg), "SVG declarations, comments and entities are not allowed");
  assert(XMLValidator.validate(svg) === true, "Malformed SVG XML");
  const tree = parser.parse(svg);
  assert(tree.length === 1 && tree[0].svg, "Expected one SVG root");
  function walk(nodes, root = false) {
    for (const node of nodes) {
      const tag = Object.keys(node).find((key) => key !== ":@");
      assert(
        tag in attributes && (root ? tag === "svg" : tag !== "svg"),
        `Forbidden element: ${tag}`,
      );
      const attrs = node[":@"] ?? {};
      if (attrs.display !== undefined)
        assert(
          tag === "g" && attrs.class === "ci-motion" && attrs.display === "none",
          "Only the motion layer may set display=none",
        );
      for (const [key, value] of Object.entries(attrs)) {
        const inherited = key in roots && key !== "viewBox" && value === roots[key];
        const part = !root && key === "data-ci-part" && kebab.test(value);
        const partClass =
          !root &&
          key === "class" &&
          (value === `ci-part-${attrs["data-ci-part"]}` ||
            (tag === "g" && ["ci-rest", "ci-motion"].includes(value)));
        const length = !root && tag !== "g" && key === "pathLength" && value === "1";
        assert(
          attributes[tag].has(key) || (!root && inherited) || part || partClass || length,
          `Forbidden attribute/value: ${tag}.${key}`,
        );
      }
      if (root) {
        for (const [key, value] of Object.entries(roots)) {
          assert(attrs[key] === value, `Root ${key} must be ${value}`);
        }
        assert(
          !attrs.xmlns || attrs.xmlns === "http://www.w3.org/2000/svg",
          "Invalid SVG namespace",
        );
      }
      if (tag === "rect") assert(attrs.rx === "2", "Rectangles must have rx=2");
      walk(node[tag]);
    }
  }
  walk(tree, true);
  return tree[0];
}

export function assertPaintBounds(svg) {
  const namespaced = /\bxmlns=/.test(svg)
    ? svg
    : svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  const bounds = new Resvg(namespaced, { font: { loadSystemFonts: false } }).getBBox();
  assert(bounds, "SVG contains no visible geometry");
  assert(
    bounds.x >= 2 &&
      bounds.y >= 2 &&
      bounds.x + bounds.width <= 22 &&
      bounds.y + bounds.height <= 22,
    "Paint exceeds the (2,2)–(22,22) live area",
  );
  // Expand the viewport to expose artwork that would otherwise be clipped away.
  const expanded = namespaced.replace(
    /\bviewBox=(["'])0 0 24 24\1/,
    'viewBox="-4 -4 32 32" width="320" height="320"',
  );
  const rendered = new Resvg(expanded, { font: { loadSystemFonts: false } }).render();
  const pixels = rendered.pixels;
  let painted = 0;
  for (let y = 0; y < 320; y++) {
    for (let x = 0; x < 320; x++) {
      if (pixels[(y * 320 + x) * 4 + 3] === 0) continue;
      painted++;
      assert(x >= 60 && x < 260 && y >= 60 && y < 260, "Paint exceeds the (2,2)–(22,22) live area");
    }
  }
  assert(painted > 0, "SVG contains no visible geometry");
}

export async function loadIcons(directory = iconDirectory) {
  const files = await readdir(directory);
  const names = files
    .filter((file) => file.endsWith(".svg"))
    .map((file) => file.slice(0, -4))
    .sort();
  assert(names.length > 0, "No icons found");
  if (directory === iconDirectory) {
    const original = JSON.parse(
      await readFile(new URL("./collection-0.1.0.json", import.meta.url)),
    );
    const additions = JSON.parse(
      await readFile(new URL("./collection-0.2.0.json", import.meta.url)),
    );
    const expected = [
      ...original.map(({ name }) => name),
      ...Object.values(additions).flat(),
    ].sort();
    assert(names.length === 200 && new Set(expected).size === 200, "Expected exactly 200 icons");
    assert(
      JSON.stringify(names) === JSON.stringify(expected),
      "Collection names differ from release inventory",
    );
  }
  assert(
    files.filter((file) => file.endsWith(".json")).length === names.length,
    "Unpaired metadata",
  );
  const claimed = new Set(names);
  const icons = [];
  const geometries = new Set();
  const smallRenders = new Set();
  for (const name of names) {
    assert(kebab.test(name), `Invalid filename: ${name}`);
    const metadata = JSON.parse(await readFile(`${directory}/${name}.json`, "utf8"));
    const svg = await readFile(`${directory}/${name}.svg`, "utf8");
    assert(metadata.name === name, `${name}: metadata name mismatch`);
    assert(typeof metadata.title === "string" && metadata.title.trim(), `${name}: missing title`);
    assert(categories.has(metadata.category), `${name}: invalid category`);
    assert(animations.has(metadata.animation), `${name}: invalid animation`);
    if (directory === iconDirectory) {
      const plan = animationPlan[name];
      assert(plan && metadata.animation === plan.motion, `${name}: animation plan mismatch`);
      assert(
        metadata.animation !== "none" || metadata.animationReason === plan.reason,
        `${name}: missing static reason`,
      );
      const tree = parseSvg(svg);
      assert(tree[":@"].class === `ci-${name}`, `${name}: missing icon namespace`);
      const found = [];
      function parts(nodes) {
        for (const node of nodes) {
          const tag = Object.keys(node).find((key) => key !== ":@");
          if (node[":@"]?.["data-ci-part"]) {
            const part = node[":@"]["data-ci-part"];
            assert(node[":@"].class === `ci-part-${part}`, `${name}: missing part class`);
            found.push(part);
          }
          parts(node[tag]);
        }
      }
      parts(tree.svg.find((node) => node[":@"]?.class === "ci-motion")?.g ?? []);
      assert(
        JSON.stringify(found.sort()) === JSON.stringify(plan.parts.map(({ part }) => part).sort()),
        `${name}: animation part coverage`,
      );
    }
    assert(
      typeof metadata.since === "string" && semver.test(metadata.since),
      `${name}: invalid since`,
    );
    assert(
      metadata.placeholder === undefined || typeof metadata.placeholder === "boolean",
      `${name}: invalid placeholder`,
    );
    for (const field of ["tags", "aliases"]) {
      const values = metadata[field];
      assert(
        Array.isArray(values) && values.every((v) => typeof v === "string" && kebab.test(v)),
        `${name}: invalid ${field}`,
      );
      assert(new Set(values).size === values.length, `${name}: duplicate ${field}`);
    }
    for (const alias of metadata.aliases) {
      const legacyAlias =
        (name === "ats-score" && alias === "resume-score") ||
        (name === "feedback" && alias === "interview-feedback");
      assert(!claimed.has(alias) || legacyAlias, `${name}: alias collision: ${alias}`);
      claimed.add(alias);
    }
    try {
      const tree = parseSvg(svg);
      assertPaintBounds(svg);
      const optimized = optimize(svg, {
        plugins: [
          { name: "preset-default", params: { overrides: { removeHiddenElems: false } } },
          "removeDimensions",
        ],
      }).data;
      assert(Buffer.byteLength(optimized) <= 1024, "Optimized SVG exceeds 1024 bytes");
      assertPaintBounds(optimized);
      const geometry = optimized.replace(/\s(?:data-ci-part|class|pathLength)="[^"]*"/g, "");
      assert(!geometries.has(geometry), "Duplicate optimized geometry");
      geometries.add(geometry);
      const small = new Resvg(optimized, {
        font: { loadSystemFonts: false },
        fitTo: { mode: "width", value: 16 },
      }).render().pixels;
      const fingerprint = createHash("sha256").update(small).digest("hex");
      assert(!smallRenders.has(fingerprint), "Duplicate artwork at 16px");
      smallRenders.add(fingerprint);
      const componentName = `${name
        .split("-")
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join("")}Icon`;
      icons.push({ metadata, svg: optimized, tree, componentName });
    } catch (error) {
      throw new Error(`${name}: ${error.message}`, { cause: error });
    }
  }
  return icons;
}
