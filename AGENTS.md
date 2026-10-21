# AGENTS.md

Source of truth for humans and coding agents working in `@democruit-labs/career-icons`. If another doc disagrees with this file, this file wins. Update this file in the same change when a command, path, or icon rule changes.

Built and maintained by [Democruit](https://democruit.com). Independent open-source project of Aequovia, LLC.

## What this repo is

A single npm package of original, career-themed outline SVG icons. No monorepo. No runtime dependencies. React is an optional peer dependency.

Do not push, tag, publish to npm, deploy GitHub Pages, or publish to Figma unless the user explicitly asks in the current request.

Do not copy or trace third-party icon sets (Lucide, Heroicons, Material, Feather, Phosphor, and others). Draw original geometry. Do not put other companies' logos or brand marks in an icon.

## Layout

```
icons/<name>.svg          source artwork (kebab-case)
icons/<name>.json         metadata for that icon
scripts/                  validate, build, pilot preview, figma export
dist/                     generated package output (gitignored)
site/                     static docs site
docs/design-system.md     pilot visual language and base shapes
docs/usage.md             consumer API and animation reference
docs/contributing.md      local development, previews and checks
docs/previews/            review images; alternatives are not package icons
tests/                    vitest
.github/workflows/ci.yml  check only; no publish or deploy
```

Published entry points:

| Import | Artifact |
| --- | --- |
| `@democruit-labs/career-icons` | metadata + raw SVG strings, one named export per icon, plus `version` (from root `package.json` at build) |
| `@democruit-labs/career-icons/react` | React components, `react` optional peer |
| `@democruit-labs/career-icons/svg/*` | optimized `.svg` files |
| `@democruit-labs/career-icons/sprite.svg` | sprite of `<symbol>`s |
| `@democruit-labs/career-icons/icons.json` | full metadata manifest |
| `@democruit-labs/career-icons/animations.css` | opt-in motion; icons stay static without this import |

JavaScript entries are side-effect free. `sideEffects` lists only `./dist/animations.css`, so bundlers keep that import and can still tree-shake icons. `publishConfig.access` is `"public"`. Only `dist/` is published.

Component names are PascalCase plus an `Icon` suffix. `ats-scan.svg` becomes `AtsScanIcon`. Filenames stay kebab-case.

Outline is the only style in 0.1.0. Keep the default export names stable so a later filled style can be added as extra files and extra exports (for example `AtsScanFilledIcon`) without renaming outline icons.

## React color and defaults

Every icon uses `stroke="currentColor"`. The default `color` is `currentColor`, so the icon inherits the parent CSS color. The `color` prop sets the icon color and overrides the parent.

`CareerIconsProvider` from `@democruit-labs/career-icons/react` supplies defaults. Icons render without a provider. Precedence is icon prop, then provider, then built-in default.

| Prop | Default |
| --- | --- |
| `size` | `24` |
| `strokeWidth` | `2` |
| `color` | `currentColor` |
| `animate` | `none` (`hover`, `always`, or `none`) |
| `animationType` | `default` (`default` or `draw`; full-icon `draw` is available for all 200 icons) |
| `animationDuration` | `560` (non-negative finite milliseconds; applies to default and draw motion) |
| `absoluteStrokeWidth` | `false` (when `true`, rendered stroke is `strokeWidth * 24 / size`) |

```jsx
import "@democruit-labs/career-icons/animations.css";

export function SaveResume() {
  return (
    <button style={{ color: "#2563EB" }}>
      <ResumeIcon />
      Save resume
    </button>
  );
}
```

`animate="hover"` runs the icon's motion once when the pointer is over the icon or any ancestor with the class `ci-hover`. Keyboard `:focus-visible` on the icon, the ancestor, or a descendant of that ancestor also triggers motion. `animate="always"` loops a motion of `animationDuration` milliseconds with a pause twice that duration (560ms motion and 1120ms pause by default). `animate="none"` leaves the icon static even if the CSS is loaded. Hover runs default to 560ms, use the configured `animationDuration`, are ease-out, and use transform, opacity, or stroke-dashoffset. `prefers-reduced-motion: reduce` disables them. `animationDuration` inherits through nested providers; an icon prop overrides it. Zero completes immediately; negative or non-finite values fall back to 560ms. React sets `--ci-animation-duration` on active icons while preserving other consumer styles; generated CSS uses it for all parts and rest/motion layer timing. Raw SVG consumers may set the same CSS custom property.

## Icon contract

Each icon is a pair: `icons/<name>.svg` and `icons/<name>.json`.

SVG:

- Root `<svg viewBox="0 0 24 24">` with `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, `stroke-linecap="round"`, `stroke-linejoin="round"`.
- No `width` or `height` attributes (SVGO strips dimensions and keeps `viewBox`).
- 2px padding. Painted strokes, caps and joins stay inside the 20×20 live area from (2,2) to (22,22). Outer centerlines normally sit between 3 and 21.
- Rectangles use `rx="2"`. Use approximately six or fewer visible static elements; motion layers may split paths. Prioritize legibility at 16px.
- Child elements may only be `path`, `circle`, `rect`, `line`, `polyline`, `polygon`, and `g`.
- A path may use `stroke-dasharray` for intentional dotted geometry, such as `ghosted`. Dots retain the same 2px round stroke.
- Root classes use `ci-<icon-name>`; animated part classes use `ci-part-<part-name>`.
- Animated icons keep original geometry in `g.ci-rest` and structured motion geometry in `g.ci-motion` with `display="none"`; CSS switches layers only during a cycle. Keep the hidden layer when optimizing SVGs.
- Full-icon draw reuses `g.ci-motion`; each leaf has a stable `ci-part-*` or `ci-s<number>` target. Disconnected subpaths draw separately inside preserved semantic part groups. `scripts/draw-plan.mjs` records stroke lengths measured at 1000× precision and staggered timing; dotted geometry and round-capped point marks use opacity reveals. `ghosted` retains its original dash pattern. Browser checks verify complete motion-layer geometry before returning to rest. React resolves `animationType` from the icon prop, then provider, then `default`; active draw mode sets `data-ci-animation-type="draw"` on the rendered root. Source roots do not use that attribute.
- Animated draw geometry may set `pathLength="1"`; static geometry must retain its original pixels.
- Animated sub-parts may set `data-ci-part` to a kebab-case name, for example `data-ci-part="check"`. No other `data-*` attributes, `id` attributes, or inline styles.
- Forbidden: `text`, raster images, gradients, filters, masks, clip paths, `style` attributes, `id` attributes, hardcoded colors, and `transform` on the root `<svg>`.
- Optimized file size must be 1 KB or under (1024 bytes).

Metadata:

```json
{
  "name": "ats-scan",
  "title": "ATS scan",
  "category": "ats",
  "tags": ["ats", "resume"],
  "aliases": ["applicant-tracking"],
  "since": "0.1.0",
  "animation": "scan"
}
```

- `name` matches the filename and is unique.
- `title` is the human label.
- `category` is one of: `resume`, `ats`, `applications`, `interviews`, `offers-salary`, `layoffs-transition`, `networking`, `remote-work`, `career-growth`, `tools`, `job-types`, `workplace`, `industries`, `inclusion`.
- `tags` and `aliases` are arrays of kebab-case strings. Tags may repeat across icons. A tag or alias may not repeat inside one icon.
- An alias may not match any icon name or another icon's alias, except the preserved legacy
  mappings `ats-score` → `resume-score` and `feedback` → `interview-feedback` in 0.2.0.
- `since` is the SemVer version that introduced the icon.
- `animation` must match the per-icon motion id in `scripts/animation-plan.mjs`. `none` requires `animationReason` matching the plan. All 200 icons have entries; four stay static. Generated CSS in `src/animations.css` must match `scripts/animations.mjs`.
- Placeholders add `"placeholder": true`. Remove that flag when the icon is final art.

## How to add an icon

1. Draw an original 24×24 outline SVG that matches the contract. Use kebab-case: `icons/<name>.svg`.
2. Add `icons/<name>.json` with `name`, `title`, `category`, `tags`, `aliases`, and `since`.
3. Run `npm run validate`. Fix every reported failure.
4. Run `npm run build` and `npm test`.
5. If the docs site already exists, confirm the icon shows up in search.
6. Commit with `feat(icons): add <name>`.

## Commands

```bash
npm run validate    # icon contract
npm run lint        # biome
npm run format      # biome --write
npm run typecheck   # tsc --noEmit
npm test            # vitest
npm run build       # dist outputs
npm run preview:pilot # pilot stroke comparison; Python 3 + Pillow
npm run preview -- <category> # category sheet; all = collection; sheets = all + categories + similarity
npm run preview:animations # pilot animation GIF; Playwright + ffmpeg
npm run size        # each React icon < 1 KB gzip; animations.css < 40 KB gzip
npm run generate:animations # regenerate src/animations.css
npm run generate:draw # regenerate all draw targets/lengths/timing + CSS; Playwright Chromium required
npm run check:animations # Playwright motion/rest/reduced-motion checks + CSS size report
npm run animations:dev # local all-icon review at /docs/animations.html
npm run site:build  # static docs
npm run release:dry-run # CI checks + npm publish --dry-run
npm run release       # same checks, npm publish, git tag v<version>
```

`release` mirrors CI (`validate` through `size`, `check:animations`, and `site:build`), confirms `dist` `version` matches
`package.json`, checks npm login and that the version is not already on the registry, then runs
`npm publish`. It creates `v<version>` unless you pass `--no-tag`. Pass `--push` to push the branch
and tag. Requires a clean git tree unless `--allow-dirty`. Does not commit or bump versions.

`validate` checks source SVG/metadata, alias uniqueness, optimized size, and painted stroke bounds
using an expanded viewport. `build` validates first, audits output coverage, and replaces generated `dist/` with all published
entry points. Root named exports are raw SVG strings (`ResumeIcon`); React entry exports components
with the same names. React remains an optional peer; render/build tools are development dependencies.

`preview:pilot` renders exactly the five pilot icons at 16, 24 and 48px on light/dark backgrounds.
It also shows the two review-only alternatives. Python 3 with Pillow is required; set `PILOT_PYTHON`
to a virtual environment executable if needed. This local preview command is not part of CI.

`size` uses `.size-limit.mjs` to check every individual React import (including shared runtime, excluding the React peer) under 1 KB gzip and `dist/animations.css` under 40 KB gzip. `site:build` builds the static preview in `site/` after the package build, including `site/dist/animations.html` from the local `docs/animations.html` demo. CI runs these checks and does not publish or deploy. The site searches all 200 icons by title/name/tags/aliases, filters fourteen categories and previews 16/24/48px on light/dark backgrounds. It also previews the five pilot animations, the provider, a `ci-hover` parent, an icon inside a colored button, and stroke controls (1 to 2, plus `absoluteStrokeWidth`).

The approved style reference is `resume`, `ats-pass`, `video-interview`, `salary-range`, and `laid-off`.
The user approved expanding the collection in task 2B. Base shapes in `docs/` and alternatives
in `docs/previews/alternatives/` are design references, excluded from package output.

## Commits

[Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/). A scope is required. Allowed scopes: `icons`, `build`, `react`, `site`, `figma`, `docs`, `repo`, `ci`.

```
feat(icons): add offer letter
fix(build): keep viewBox in optimized svg
ci(ci): run size-limit on the react entry
```

Commitlint enforces conventional type and required scope only. Husky runs lint-staged, then commitlint.

## Tooling choices

- Biome for format and lint (one tool, no ESLint/Prettier split). Raw SVG artwork is exempt from `noSvgWithoutTitle` because the icon contract forbids title elements. Consumers provide an accessible label or mark decorative icons hidden.
- Vitest for unit tests.
- TypeScript `strict`, plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and `verbatimModuleSyntax`.
- Node `>=20`. CI uses the version in `.nvmrc`.

## Full collection

The 0.2.0 collection is exactly 200 icons; `scripts/collection-0.2.0.json` lists the 140 additions.
The 0.1.0 collection contained 60 icons. Task 2B listed 56 additions but requested 55;
`applied-count` was omitted because its stacked documents overlap `resume-template`.
Category decisions and open review questions live in `docs/full-set-report.md`.
`npm run preview -- <category>` creates `docs/previews/<category>.png`; `all` creates the
full sheet at `docs/previews/all.png`. `sheets` also creates all category sheets and
`docs/previews/similarity.png` with related icons side by side; `docs/previews/index.json`
records category counts and sheet paths. These local previews require Python 3 with Pillow.
