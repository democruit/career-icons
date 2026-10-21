import { spawnSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { loadIcons } from "./icons.mjs";

const category = process.argv[2] ?? "all";
const icons = await loadIcons();
const names = icons.map(({ metadata }) => metadata.name);
const categories = [...new Set(icons.map(({ metadata }) => metadata.category))].sort();
const similarityGroups = [
  [
    "Documents",
    names.filter((name) => /resume|transcript|references|background|cover-letter/.test(name)),
  ],
  [
    "Applications",
    names.filter((name) => /application|apply|ats-|shortlisted|rejection|job-match/.test(name)),
  ],
  [
    "Interviews",
    names.filter((name) =>
      /interview|feedback|questions|thank-you|star-method|coding|take-home|final-round/.test(name),
    ),
  ],
  ["Offers and pay", names.filter((name) => /offer|salary|bonus|pay|compensation/.test(name))],
  [
    "Growth and roles",
    names.filter((name) => /career|skill|learning|mentor|promotion|leadership|role/.test(name)),
  ],
  [
    "Job types and industries",
    icons
      .filter(({ metadata }) => ["job-types", "industries"].includes(metadata.category))
      .map(({ metadata }) => metadata.name),
  ],
  [
    "Time and workplace",
    names.filter((name) =>
      /day|week|time|hours|date|deadline|calendar|office|onboarding|probation|commute/.test(name),
    ),
  ],
  [
    "People and support",
    names.filter((name) =>
      /network|team|group|panel|manager|coach|person|diversity|leave|support|volunteer|mental|brand/.test(
        name,
      ),
    ),
  ],
  [
    "Tools",
    icons
      .filter(({ metadata }) => metadata.category === "tools")
      .map(({ metadata }) => metadata.name),
  ],
];
const targets = category === "sheets" ? ["all", ...categories, "similarity"] : [category];
const pilotNames = ["resume", "ats-pass", "video-interview", "salary-range", "laid-off"];
const temporary = await mkdtemp(join(tmpdir(), "career-icons-sheet-"));
try {
  for (const { metadata, svg } of icons) {
    for (const [theme, color] of [
      ["light", "#243447"],
      ["dark", "#eef3fa"],
    ]) {
      for (const size of [16, 24, 48]) {
        const png = new Resvg(svg.replaceAll("currentColor", color), {
          font: { loadSystemFonts: false },
          fitTo: { mode: "width", value: size },
        })
          .render()
          .asPng();
        await writeFile(join(temporary, `${metadata.name}-${theme}-${size}.png`), png);
      }
    }
  }
  for (const target of targets) {
    const selected = icons
      .filter(({ metadata }) => target === "all" || metadata.category === target)
      .map(({ metadata }) => metadata.name);
    const groups = target === "similarity" ? similarityGroups : undefined;
    if (!selected.length && !groups) throw new Error(`Unknown or empty category: ${target}`);
    await writeFile(
      join(temporary, "sheet.json"),
      JSON.stringify({ category: target, names: selected, groups, pilotNames }),
    );
    const result = spawnSync(
      process.env.PILOT_PYTHON ?? "python3",
      [
        fileURLToPath(new URL("./preview.py", import.meta.url)),
        temporary,
        fileURLToPath(new URL(`../docs/previews/${target}.png`, import.meta.url)),
      ],
      { stdio: "inherit" },
    );
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error("Contact sheets require Python 3 and Pillow");
  }
  if (category === "sheets") {
    await writeFile(
      fileURLToPath(new URL("../docs/previews/index.json", import.meta.url)),
      `${JSON.stringify(
        {
          version: "0.2.0",
          iconCount: icons.length,
          categories: Object.fromEntries(
            categories.map((name) => [
              name,
              icons.filter(({ metadata }) => metadata.category === name).length,
            ]),
          ),
          sizes: [16, 24, 48],
          themes: ["light", "dark"],
          sheets: [...targets, "pilot"].map((name) => `docs/previews/${name}.png`),
        },
        null,
        2,
      )}\n`,
    );
  }
} finally {
  await rm(temporary, { recursive: true, force: true });
}
