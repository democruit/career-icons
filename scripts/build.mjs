import { mkdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { loadIcons } from "./icons.mjs";

const reactAttributes = {
  "stroke-width": "strokeWidth",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
};
function reactProps(attributes) {
  return Object.fromEntries(
    Object.entries(attributes).map(([key, value]) => [reactAttributes[key] ?? key, value]),
  );
}
function element(node) {
  const tag = Object.keys(node).find((key) => key !== ":@");
  const children = node[tag].map(element);
  return `createElement(${JSON.stringify(tag)}, ${JSON.stringify(reactProps(node[":@"] ?? {}))}${children.length ? `, ${children.join(", ")}` : ""})`;
}

export async function buildIcons(output = fileURLToPath(new URL("../dist/", import.meta.url))) {
  const icons = await loadIcons();
  await rm(output, { recursive: true, force: true });
  await mkdir(`${output}/svg`, { recursive: true });
  await mkdir(`${output}/react`, { recursive: true });
  const manifest = icons.map(({ metadata }) => metadata);
  const records = icons.map(({ metadata, svg }) => ({ ...metadata, svg }));
  const declarations = [
    "export interface IconMetadata { name: string; title: string; category: string; tags: string[]; aliases: string[]; since: string; placeholder?: boolean; }",
    "export declare const icons: ReadonlyArray<IconMetadata & { svg: string }>;",
  ];
  const esm = [`export const icons = ${JSON.stringify(records)};`];
  const cjs = [`"use strict";`, `exports.icons = ${JSON.stringify(records)};`];
  const reactEsm = ['import { createElement } from "react";'];
  const reactCjs = ['"use strict";', 'const { createElement } = require("react");'];
  const reactTypes = ['import type { FunctionComponent, SVGProps } from "react";'];
  const symbols = [];
  for (const { metadata, svg, tree, componentName } of icons) {
    await writeFile(`${output}/svg/${metadata.name}.svg`, `${svg}\n`);
    esm.push(`export const ${componentName} = ${JSON.stringify(svg)};`);
    cjs.push(`exports.${componentName} = ${JSON.stringify(svg)};`);
    declarations.push(`export declare const ${componentName}: string;`);
    const props = { width: 24, height: 24, ...reactProps(tree[":@"]) };
    const component = `function ${componentName}(props = {}) { return createElement("svg", { ...${JSON.stringify(props)}, ...props }, ${tree.svg.map(element).join(", ")}); }`;
    reactEsm.push(`export ${component}`);
    reactCjs.push(`${component}\nexports.${componentName} = ${componentName};`);
    reactTypes.push(
      `export declare const ${componentName}: FunctionComponent<SVGProps<SVGSVGElement>>;`,
    );
    symbols.push(
      svg.replace(/^<svg\b/, `<symbol id="${metadata.name}"`).replace(/<\/svg>$/, "</symbol>"),
    );
  }
  const outputs = {
    "index.js": esm.join("\n"),
    "index.cjs": cjs.join("\n"),
    "index.d.ts": declarations.join("\n"),
    "react/index.js": reactEsm.join("\n"),
    "react/index.cjs": reactCjs.join("\n"),
    "react/index.d.ts": reactTypes.join("\n"),
    "icons.json": JSON.stringify(manifest, null, 2),
    "sprite.svg": `<svg xmlns="http://www.w3.org/2000/svg">${symbols.join("")}</svg>`,
  };
  for (const [name, content] of Object.entries(outputs))
    await writeFile(`${output}/${name}`, `${content}\n`);
  return icons;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const icons = await buildIcons();
  console.log(
    `Built ${icons.length} icons: SVGs, ESM/CJS, React, declarations, metadata and sprite.`,
  );
}
