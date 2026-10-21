import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { optimize } from "svgo";
import { parseSvg } from "./icons.mjs";

const directory = fileURLToPath(new URL("../icons/", import.meta.url));
const names = (await readdir(directory)).filter((name) => name.endsWith(".svg")).sort();
const tag = (node) => Object.keys(node).find((key) => key !== ":@");
function serialize(node, depth = 0) {
  const name = tag(node);
  const attrs = Object.entries(node[":@"] ?? {})
    .map(([key, value]) => ` ${key}="${value}"`)
    .join("");
  const indent = "  ".repeat(depth);
  return node[name].length
    ? `${indent}<${name}${attrs}>\n${node[name].map((child) => serialize(child, depth + 1)).join("\n")}\n${indent}</${name}>`
    : `${indent}<${name}${attrs}/>`;
}
const records = [];
for (const filename of names) {
  const root = parseSvg(await readFile(`${directory}/${filename}`, "utf8"));
  // Preserve original rest geometry and all approved semantic motion targets.
  root.svg = root.svg.filter((node) => node[":@"]?.class !== "ci-draw");
  let rest = root.svg.find((node) => node[":@"]?.class === "ci-rest");
  let motion = root.svg.find((node) => node[":@"]?.class === "ci-motion");
  if (!rest) {
    rest = { g: root.svg, ":@": { class: "ci-rest" } };
    motion = { g: structuredClone(root.svg), ":@": { class: "ci-motion", display: "none" } };
    root.svg = [rest, motion];
  }
  const targets = [];
  const pointStroke = (d) => {
    const match = d.match(/^M([\d.]+) ([\d.]+)H([\d.]+)$/);
    return match && Math.abs(Number(match[3]) - Number(match[1])) <= 0.05;
  };
  // A dash offset restarts at every moveto. Give disconnected strokes their
  // own timeline, while retaining named groups for the semantic animation.
  function splitPaths(nodes) {
    return nodes.flatMap((node) => {
      if (node.g) {
        // Round-capped point marks have no meaningful line to draw. Retain
        // their compact semantic group as one path and reveal its opacity.
        if (
          node[":@"]?.["data-ci-part"] &&
          node.g.every((child) => child.path && pointStroke(child[":@"].d))
        )
          return [
            { path: [], ":@": { ...node[":@"], d: node.g.map((child) => child[":@"].d).join("") } },
          ];
        node.g = splitPaths(node.g);
        return [node];
      }
      if (!node.path || (node[":@"].d.match(/[Mm]/g) ?? []).length < 2) return [node];
      const attrs = node[":@"];
      if (attrs.d.match(/M[^M]*/g).every(pointStroke)) return [node];
      if (attrs.d.includes("m")) throw new Error(`${filename}: split relative movetos explicitly`);
      const paths = attrs.d.match(/M[^M]*/g).map((d) => {
        const { class: _class, "data-ci-part": _part, ...geometry } = attrs;
        return { path: [], ":@": { ...geometry, d: d.trim() } };
      });
      return attrs["data-ci-part"]
        ? [{ g: paths, ":@": { "data-ci-part": attrs["data-ci-part"], class: attrs.class } }]
        : paths;
    });
  }
  motion.g = splitPaths(motion.g);
  const measurements = [];
  function strokes(nodes) {
    for (const node of nodes) {
      const name = tag(node);
      if (name === "g") {
        strokes(node.g);
        continue;
      }
      node[":@"] ??= {};
      const attrs = node[":@"];
      // Existing named leaf parts already provide stable CSS targets.
      const target = attrs["data-ci-part"]
        ? `ci-part-${attrs["data-ci-part"]}`
        : `ci-s${targets.length + 1}`;
      attrs.class = target;
      targets.push(target);
      // Measure at 1000x precision: Chromium otherwise approximates a small
      // circle as a polygon and undercounts short curves and rounded corners.
      const measurement = structuredClone(node);
      const geometry = measurement[":@"];
      delete geometry.class;
      delete geometry["data-ci-part"];
      delete geometry.pathLength;
      if (name === "circle" || name === "rect") {
        for (const key of ["cx", "cy", "r", "x", "y", "width", "height", "rx", "ry"])
          if (geometry[key] !== undefined) geometry[key] = String(Number(geometry[key]) * 1000);
        measurements.push(serialize(measurement));
      } else {
        geometry.transform = "scale(1000)";
        measurements.push(
          optimize(`<svg>${serialize(measurement)}</svg>`, {
            plugins: [
              { name: "convertShapeToPath", params: { convertArcs: true } },
              { name: "convertPathData", params: { floatPrecision: 6 } },
            ],
          }).data.replace(/^<svg>|<\/svg>$/g, ""),
        );
      }
    }
  }
  strokes(motion.g);
  const svg = serialize(root);
  await writeFile(`${directory}/${filename}`, `${svg}\n`);
  records.push({ name: filename.slice(0, -4), svg, targets, measurements });
}
const browser = await chromium.launch();
let measured;
try {
  const page = await browser.newPage();
  await page.setContent(
    records
      .map(
        ({ name, svg, measurements }) =>
          `<div data-icon="${name}">${svg}<svg class="measurements">${measurements.join("")}</svg></div>`,
      )
      .join(""),
  );
  measured = await page.evaluate(() =>
    Object.fromEntries(
      [...document.querySelectorAll("[data-icon]")].map((container) => {
        const shapes = [
          ...container.querySelectorAll(
            ".ci-motion path,.ci-motion circle,.ci-motion rect,.ci-motion line,.ci-motion polyline,.ci-motion polygon",
          ),
        ];
        const lengths = [...container.querySelector(".measurements").children];
        const parts = shapes.map((shape, index) => {
          const count = shapes.length;
          const start = count === 1 ? 2 : Number((2 + (60 * index) / (count - 1)).toFixed(2));
          const end = count === 1 ? 96 : Math.min(96, start + 44);
          return {
            target: shape.getAttribute("class"),
            length: shape.hasAttribute("pathLength")
              ? Number(shape.getAttribute("pathLength"))
              : Math.ceil((lengths[index].getTotalLength() / 1000) * 100) / 100,
            start,
            end,
            ...(shape.hasAttribute("stroke-dasharray") || shape.getTotalLength() < 0.1
              ? { dotted: true }
              : {}),
          };
        });
        return [container.dataset.icon, parts];
      }),
    ),
  );
} finally {
  await browser.close();
}
// Keep the approved ResumeIcon phases, drawing its four text strokes separately.
const resumeTiming = [
  [2, 46],
  [26, 54],
  [40, 68],
  [62, 78],
  [68, 84],
  [74, 90],
  [80, 96],
];
measured.resume.forEach((part, index) => {
  [part.start, part.end] = resumeTiming[index];
});
await writeFile(
  new URL("./draw-plan.mjs", import.meta.url),
  `// Generated by scripts/generate-draw.mjs from SVG geometry.\nexport const drawPlan = ${JSON.stringify(measured, null, 2)};\n`,
);
const inventoryUrl = new URL("../docs/previews/animation-inventory.csv", import.meta.url);
const inventory = await readFile(inventoryUrl, "utf8");
await writeFile(
  inventoryUrl,
  inventory
    .split("\n")
    .map((line) => {
      const name = line.match(/^"([^"]+)"/)?.[1];
      return measured[name] ? line.replace(/"\d+"$/, `"${measured[name].length}"`) : line;
    })
    .join("\n"),
);
console.log(
  `Prepared full-icon draw targets and measured stroke lengths for ${records.length} icons.`,
);
