import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { loadIcons } from "./icons.mjs";

const reactRuntime = `const defaults = { size: 24, strokeWidth: 2, color: "currentColor", animate: "none", absoluteStrokeWidth: false };
const CareerIconsContext = createContext(defaults);
function CareerIconsProvider({ children, size, strokeWidth, color, animate, absoluteStrokeWidth }) {
  const parent = useContext(CareerIconsContext);
  return createElement(CareerIconsContext.Provider, { value: {
    size: size ?? parent.size,
    strokeWidth: strokeWidth ?? parent.strokeWidth,
    color: color ?? parent.color,
    animate: animate ?? parent.animate,
    absoluteStrokeWidth: absoluteStrokeWidth ?? parent.absoluteStrokeWidth,
  } }, children);
}
function resolveIconProps(props = {}) {
  const parent = useContext(CareerIconsContext);
  const { size, strokeWidth, color, animate, absoluteStrokeWidth, width, height, ...rest } = props;
  const resolvedSize = size ?? parent.size;
  const resolvedStroke = strokeWidth ?? parent.strokeWidth;
  const mode = animate ?? parent.animate;
  const absolute = absoluteStrokeWidth ?? parent.absoluteStrokeWidth;
  const box = Number(width ?? height ?? resolvedSize);
  return {
    width: width ?? resolvedSize,
    height: height ?? resolvedSize,
    color: color ?? parent.color,
    strokeWidth: absolute ? (Number(resolvedStroke) * 24) / box : resolvedStroke,
    ...(mode !== "none" ? { "data-ci-animate": mode } : {}),
    ...rest,
  };
}`;

const reactAttributes = {
  "stroke-width": "strokeWidth",
  "stroke-dasharray": "strokeDasharray",
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
    'export type IconAnimation = "none" | "draw" | "draw-check" | "nudge-right" | "scan" | "wiggle" | "pop" | "slide";',
    "export interface IconMetadata { name: string; title: string; category: string; tags: string[]; aliases: string[]; since: string; animation: IconAnimation; placeholder?: boolean; }",
    "export declare const icons: ReadonlyArray<IconMetadata & { svg: string }>;",
  ];
  const esm = [`export const icons = ${JSON.stringify(records)};`];
  const cjs = [`"use strict";`, `exports.icons = ${JSON.stringify(records)};`];
  const reactEsm = [
    '"use client";',
    'import { createContext, createElement, useContext } from "react";',
    reactRuntime,
    "export { CareerIconsContext, CareerIconsProvider };",
  ];
  const reactCjs = [
    '"use strict";',
    'const { createContext, createElement, useContext } = require("react");',
    reactRuntime,
    "exports.CareerIconsContext = CareerIconsContext;",
    "exports.CareerIconsProvider = CareerIconsProvider;",
  ];
  const reactTypes = [
    'import type { Context, FunctionComponent, ReactNode, SVGProps } from "react";',
    'export type CareerIconAnimate = "hover" | "always" | "none";',
    "export interface CareerIconsContextValue { size: number | string; strokeWidth: number | string; color: string; animate: CareerIconAnimate; absoluteStrokeWidth: boolean; }",
    "export declare const CareerIconsContext: Context<CareerIconsContextValue>;",
    "export interface CareerIconsProviderProps { size?: number | string; strokeWidth?: number | string; color?: string; animate?: CareerIconAnimate; absoluteStrokeWidth?: boolean; children?: ReactNode; }",
    "export declare const CareerIconsProvider: FunctionComponent<CareerIconsProviderProps>;",
    "export interface CareerIconProps extends SVGProps<SVGSVGElement> { size?: number | string; animate?: CareerIconAnimate; absoluteStrokeWidth?: boolean; }",
  ];
  const symbols = [];
  for (const { metadata, svg, tree, componentName } of icons) {
    await writeFile(`${output}/svg/${metadata.name}.svg`, `${svg}\n`);
    esm.push(`export const ${componentName} = ${JSON.stringify(svg)};`);
    cjs.push(`exports.${componentName} = ${JSON.stringify(svg)};`);
    declarations.push(`export declare const ${componentName}: string;`);
    const root = JSON.stringify(reactProps(tree[":@"]));
    const children = tree.svg.map(element).join(", ");
    const component = `function ${componentName}(props) { return createElement("svg", { ...${root}, ...resolveIconProps(props) }, ${children}); }`;
    reactEsm.push(`export ${component}`);
    reactCjs.push(`${component}\nexports.${componentName} = ${componentName};`);
    reactTypes.push(`export declare const ${componentName}: FunctionComponent<CareerIconProps>;`);
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
  const css = await readFile(fileURLToPath(new URL("../src/animations.css", import.meta.url)));
  await writeFile(`${output}/animations.css`, css);
  return icons;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const icons = await buildIcons();
  console.log(
    `Built ${icons.length} icons: SVGs, ESM/CJS, React, declarations, metadata, sprite and animations.css.`,
  );
}
