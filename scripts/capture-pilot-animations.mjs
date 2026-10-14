import { spawn } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const output = fileURLToPath(new URL("../docs/previews/pilot-animations.gif", import.meta.url));
const port = 5198;
const framesDir = join(tmpdir(), `career-icons-frames-${Date.now()}`);

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", ...options });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with ${code}`));
    });
  });
}

async function waitForServer(url, attempts = 40) {
  for (let index = 0; index < attempts; index++) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // retry
    }
    await wait(250);
  }
  throw new Error(`Server did not start at ${url}`);
}

let preview;
try {
  await mkdir(framesDir, { recursive: true });
  preview = spawn(
    "npx",
    [
      "vite",
      "preview",
      "--config",
      "site/vite.config.js",
      "--host",
      "127.0.0.1",
      `--port`,
      `${port}`,
      "--strictPort",
    ],
    { cwd: root, stdio: "ignore" },
  );

  const url = `http://127.0.0.1:${port}/?capture`;
  await waitForServer(url);

  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    throw new Error(
      "Install playwright first: npm install --save-dev playwright && npx playwright install chromium",
    );
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1120, height: 420 } });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  const frameCount = 36;
  for (let frame = 0; frame < frameCount; frame++) {
    const buffer = await page.screenshot({ type: "png" });
    await writeFile(join(framesDir, `frame-${String(frame).padStart(3, "0")}.png`), buffer);
    await page.waitForTimeout(80);
  }

  await browser.close();

  const palette = join(framesDir, "palette.png");
  await run("ffmpeg", [
    "-y",
    "-framerate",
    "12",
    "-i",
    join(framesDir, "frame-%03d.png"),
    "-vf",
    "palettegen=stats_mode=diff",
    "-frames:v",
    "1",
    palette,
  ]);
  await run("ffmpeg", [
    "-y",
    "-framerate",
    "12",
    "-i",
    join(framesDir, "frame-%03d.png"),
    "-i",
    palette,
    "-lavfi",
    "paletteuse=dither=bayer:bayer_scale=3",
    "-loop",
    "0",
    output,
  ]);
  console.log(`Wrote ${output}`);
} finally {
  preview?.kill("SIGTERM");
  await rm(framesDir, { recursive: true, force: true });
}
