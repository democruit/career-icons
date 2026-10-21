import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";

export async function auditBuild(output, icons, version) {
  const files = [
    "icons.json",
    "sprite.svg",
    "index.js",
    "index.cjs",
    "index.d.ts",
    "react/index.js",
    "react/index.cjs",
    "react/index.d.ts",
  ];
  const [manifest, sprite, ...entries] = await Promise.all(
    files.map((file) => readFile(`${output}/${file}`, "utf8")),
  );
  const names = icons.map(({ metadata }) => metadata.name);
  const exports = icons.map(({ componentName }) => componentName);
  assert.equal(new Set(names).size, 200, "Expected exactly 200 unique names");
  assert.deepEqual(
    JSON.parse(manifest),
    icons.map(({ metadata }) => metadata),
    "Manifest coverage",
  );
  assert.deepEqual(
    [...sprite.matchAll(/<symbol\s+id="([^"]+)"/g)].map((match) => match[1]),
    names,
    "Sprite coverage",
  );
  assert.deepEqual(
    (await readdir(`${output}/svg`)).sort(),
    names.map((name) => `${name}.svg`).sort(),
    "SVG coverage",
  );
  for (const entry of entries) {
    const found = [
      ...entry.matchAll(
        /(?:export (?:const |declare const |function )|exports\.)([A-Z]\w*Icon)\b/g,
      ),
    ].map((match) => match[1]);
    assert.deepEqual(found, exports, "Raw/React export and declaration coverage");
  }
  assert.ok(
    entries[0].includes(`export const version = ${JSON.stringify(version)};`),
    "Package version",
  );
  for (const { metadata, svg } of icons) {
    assert.equal(
      (await readFile(`${output}/svg/${metadata.name}.svg`, "utf8")).trim(),
      svg,
      `${metadata.name}: generated SVG differs`,
    );
  }
}
