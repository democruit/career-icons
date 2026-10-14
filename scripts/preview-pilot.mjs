import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { assertPaintBounds, loadIcons, parseSvg } from "./icons.mjs";

const order = ["resume", "ats-pass", "video-interview", "salary-range", "laid-off"];
const icons = await loadIcons();
if (icons.length !== 5 || icons.some(({ metadata }) => !order.includes(metadata.name))) {
  throw new Error("Pilot preview requires exactly the five approved pilot names");
}
const sources = new Map(icons.map(({ metadata, svg }) => [metadata.name, svg]));
for (const name of ["resume-alt", "laid-off-alt"]) {
  const svg = await readFile(
    new URL(`../docs/previews/alternatives/${name}.svg`, import.meta.url),
    "utf8",
  );
  parseSvg(svg);
  assertPaintBounds(svg);
  sources.set(name, svg);
}
const temporary = await mkdtemp(join(tmpdir(), "career-icons-pilot-"));
try {
  for (const [name, svg] of sources) {
    for (const [theme, color] of [
      ["light", "#243447"],
      ["dark", "#eef3fa"],
    ]) {
      for (const stroke of ["1.5", "2"]) {
        const stroked = svg.replace('stroke-width="1.5"', `stroke-width="${stroke}"`);
        for (const size of [16, 24, 32, 48]) {
          const colored = stroked.replaceAll("currentColor", color);
          const png = new Resvg(colored, { fitTo: { mode: "width", value: size } })
            .render()
            .asPng();
          await writeFile(join(temporary, `${name}-${theme}-${stroke}-${size}.png`), png);
        }
      }
    }
  }
  const result = spawnSync(
    process.env.PILOT_PYTHON ?? "python3",
    [
      fileURLToPath(new URL("./preview-pilot.py", import.meta.url)),
      temporary,
      fileURLToPath(new URL("../docs/previews/pilot.png", import.meta.url)),
    ],
    { stdio: "inherit" },
  );
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error("Preview needs Python 3 with Pillow; see docs/design-system.md");
} finally {
  await rm(temporary, { recursive: true, force: true });
}
