import { spawnSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { loadIcons } from "./icons.mjs";

const category = process.argv[2] ?? "all";
const icons = await loadIcons();
const selected = icons.filter(
  ({ metadata }) => category === "all" || metadata.category === category,
);
if (!selected.length) throw new Error(`Unknown or empty category: ${category}`);
const pilotNames = ["resume", "ats-pass", "video-interview", "salary-range", "laid-off"];
const temporary = await mkdtemp(join(tmpdir(), "career-icons-sheet-"));
try {
  await writeFile(
    join(temporary, "sheet.json"),
    JSON.stringify({ category, names: selected.map(({ metadata }) => metadata.name), pilotNames }),
  );
  for (const { metadata, svg } of icons) {
    if (
      !selected.some((item) => item.metadata.name === metadata.name) &&
      !pilotNames.includes(metadata.name)
    )
      continue;
    for (const [theme, color] of [
      ["light", "#243447"],
      ["dark", "#eef3fa"],
    ]) {
      for (const size of [16, 24, 48]) {
        const png = new Resvg(svg.replaceAll("currentColor", color), {
          fitTo: { mode: "width", value: size },
        })
          .render()
          .asPng();
        await writeFile(join(temporary, `${metadata.name}-${theme}-${size}.png`), png);
      }
    }
  }
  const result = spawnSync(
    process.env.PILOT_PYTHON ?? "python3",
    [
      fileURLToPath(new URL("./preview.py", import.meta.url)),
      temporary,
      fileURLToPath(new URL(`../docs/previews/${category}.png`, import.meta.url)),
    ],
    { stdio: "inherit" },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error("Contact sheets require Python 3 and Pillow");
} finally {
  await rm(temporary, { recursive: true, force: true });
}
