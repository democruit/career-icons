import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = fileURLToPath(new URL("..", import.meta.url));
const output = `${root}/site/dist`;
await mkdir(`${output}/assets`, { recursive: true });
await build({
  entryPoints: [`${root}/docs/animations-demo.mjs`],
  outfile: `${output}/assets/animations-demo.js`,
  bundle: true,
  minify: true,
  format: "esm",
});
await copyFile(`${root}/dist/animations.css`, `${output}/assets/career-animations.css`);
await copyFile(`${root}/docs/animations-demo.css`, `${output}/assets/animations-demo.css`);
const html = (await readFile(`${root}/docs/animations.html`, "utf8"))
  .replace("../dist/animations.css", "./assets/career-animations.css")
  .replace("./animations-demo.css", "./assets/animations-demo.css")
  .replace("./animations-demo.mjs", "./assets/animations-demo.js");
await writeFile(`${output}/animations.html`, html);
console.log("Built site/dist/animations.html with all 200 motion previews.");
