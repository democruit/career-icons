import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const packageName = "@democruit-labs/career-icons";

const flags = new Set(process.argv.slice(2));

function usage() {
  console.log(`Publish ${packageName} to npm after CI-equivalent checks.

Usage:
  node scripts/release.mjs [options]

Options:
  --dry-run       Run checks and npm publish --dry-run; no tag or registry upload
  --no-tag        Publish only; do not create a git tag
  --push          After tagging, push the current branch and the release tag
  --skip-site     Skip npm run site:build (CI runs it; publish does not require it)
  --allow-dirty   Allow uncommitted git changes (default: require clean working tree)
  -h, --help      Show this help

Examples:
  npm run release:dry-run
  npm run release
  npm run release -- --push
`);
}

if (flags.has("-h") || flags.has("--help")) {
  usage();
  process.exit(0);
}

const dryRun = flags.has("--dry-run");
const noTag = flags.has("--no-tag");
const push = flags.has("--push");
const skipSite = flags.has("--skip-site");
const allowDirty = flags.has("--allow-dirty");

function run(command, args, { quiet = false } = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: quiet ? "pipe" : "inherit",
    encoding: "utf8",
  });
  if (result.status !== 0) {
    if (quiet && result.stderr) process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }
  return result;
}

function capture(command, args) {
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8" });
  return {
    status: result.status ?? 1,
    stdout: (result.stdout ?? "").trim(),
    stderr: result.stderr ?? "",
  };
}

function readPackageVersion() {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  if (typeof pkg.version !== "string" || !/^\d+\.\d+\.\d+/.test(pkg.version)) {
    console.error("package.json version must be a SemVer string.");
    process.exit(1);
  }
  return pkg.version;
}

function assertCleanGit() {
  const { status, stdout } = capture("git", ["status", "--porcelain"]);
  if (status !== 0) {
    console.error("git status failed. Run this script from a git checkout.");
    process.exit(1);
  }
  if (stdout && !allowDirty) {
    console.error(
      "Working tree has uncommitted changes. Commit or stash first, or pass --allow-dirty.",
    );
    process.exit(1);
  }
}

function assertNpmLogin() {
  const { status, stdout } = capture("npm", ["whoami"]);
  if (status !== 0) {
    console.error("Not logged in to npm. Run: npm login");
    process.exit(1);
  }
  console.log(`npm user: ${stdout}`);
}

function assertNotAlreadyPublished(version) {
  const result = capture("npm", ["view", packageName, "version"]);
  if (result.status !== 0) {
    const message = `${result.stdout}\n${result.stderr}`;
    if (/E404|404 Not Found/i.test(message)) {
      console.log("No existing release on npm for this package (OK for first publish).");
      return;
    }
    console.error("Could not read npm registry:", result.stderr || result.stdout);
    process.exit(1);
  }
  if (result.stdout === version) {
    console.error(`${packageName}@${version} is already on npm. Bump package.json version first.`);
    process.exit(1);
  }
  console.log(`Latest on npm: ${result.stdout} → publishing ${version}`);
}

function assertBuiltVersion(version) {
  const built = readFileSync(new URL("../dist/index.js", import.meta.url), "utf8");
  const match = built.match(/^export const version = (.+);$/m);
  if (!match) {
    console.error("dist/index.js is missing export const version. Run npm run build.");
    process.exit(1);
  }
  const exported = JSON.parse(match[1]);
  if (exported !== version) {
    console.error(
      `dist version "${exported}" does not match package.json "${version}". Run npm run build.`,
    );
    process.exit(1);
  }
}

function assertTagAvailable(version) {
  if (noTag || dryRun) return;
  const tag = `v${version}`;
  const { status, stdout } = capture("git", ["tag", "-l", tag]);
  if (status !== 0) process.exit(1);
  if (stdout.split("\n").filter(Boolean).includes(tag)) {
    console.error(`Git tag ${tag} already exists. Remove it or bump the version.`);
    process.exit(1);
  }
}

function runChecks() {
  const steps = ["validate", "lint", "typecheck", "test", "build", "size"];
  if (!skipSite) steps.push("site:build");
  for (const step of steps) {
    console.log(`\n▶ npm run ${step}`);
    run("npm", ["run", step]);
  }
}

const version = readPackageVersion();
console.log(`Release ${packageName}@${version}${dryRun ? " (dry run)" : ""}`);

assertCleanGit();
assertNpmLogin();
assertNotAlreadyPublished(version);
runChecks();
assertBuiltVersion(version);
assertTagAvailable(version);

console.log(`\n▶ npm publish${dryRun ? " --dry-run" : ""}`);
run("npm", dryRun ? ["publish", "--dry-run"] : ["publish"]);

if (!noTag && !dryRun) {
  const tag = `v${version}`;
  console.log(`\n▶ git tag ${tag}`);
  run("git", ["tag", tag]);
  if (push) {
    console.log("\n▶ git push (branch + tag)");
    run("git", ["push"]);
    run("git", ["push", "origin", tag]);
  } else {
    console.log(`\nCreated tag ${tag}. Push when ready: git push && git push origin ${tag}`);
  }
}

console.log("\nDone.");
