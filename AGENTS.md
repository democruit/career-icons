# AGENTS.md

Source of truth for humans and coding agents working in `@democruit/career-icons`. If another doc disagrees with this file, this file wins. Update this file in the same change when a command, path, or icon rule changes.

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
docs/previews/            review images; alternatives are not package icons
tests/                    vitest
.github/workflows/ci.yml  check only; no publish or deploy
```

Published entry points:

| Import | Artifact |
| --- | --- |
| `@democruit/career-icons` | metadata + raw SVG strings, one named export per icon |
| `@democruit/career-icons/react` | React components, `react` optional peer |
| `@democruit/career-icons/svg/*` | optimized `.svg` files |
| `@democruit/career-icons/sprite.svg` | sprite of `<symbol>`s |
| `@democruit/career-icons/icons.json` | full metadata manifest |
| `@democruit/career-icons/animations.css` | opt-in motion; icons stay static without this import |

JavaScript entries are side-effect free. `sideEffects` lists only `./dist/animations.css`, so bundlers keep that import and can still tree-shake icons. `publishConfig.access` is `"public"`. Only `dist/` is published.

Component names are PascalCase plus an `Icon` suffix. `ats-scan.svg` becomes `AtsScanIcon`. Filenames stay kebab-case.

Outline is the only style in 0.1.0. Keep the default export names stable so a later filled style can be added as extra files and extra exports (for example `AtsScanFilledIcon`) without renaming outline icons.

## React color and defaults

Every icon uses `stroke="currentColor"`. The default `color` is `currentColor`, so the icon inherits the parent CSS color. The `color` prop sets the icon color and overrides the parent.

`CareerIconsProvider` from `@democruit/career-icons/react` supplies defaults. Icons render without a provider. Precedence is icon prop, then provider, then built-in default.

| Prop | Default |
| --- | --- |
| `size` | `24` |
| `strokeWidth` | `2` |
| `color` | `currentColor` |
| `animate` | `none` (`hover`, `always`, or `none`) |
| `absoluteStrokeWidth` | `false` (when `true`, stroke stays visually constant as size changes) |

```jsx
import "@democruit/career-icons/animations.css";

export function SaveResume() {
  return (
    <button style={{ color: "#2563EB" }}>
      <ResumeIcon />
      Save resume
    </button>
  );
}
```

`animate="hover"` runs the icon's motion once when the pointer is over the icon or any ancestor with the class `ci-hover`. `animate="always"` loops that motion. `animate="none"` leaves the icon static even if the CSS is loaded. Hover runs are 300–500ms, ease-out, and use transform, opacity, or stroke-dashoffset. `prefers-reduced-motion: reduce` disables them.

## Icon contract

Each icon is a pair: `icons/<name>.svg` and `icons/<name>.json`.

SVG:

- Root `<svg viewBox="0 0 24 24">` with `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, `stroke-linecap="round"`, `stroke-linejoin="round"`.
- No `width` or `height` attributes (SVGO strips dimensions and keeps `viewBox`).
- 2px padding. Painted strokes, caps and joins stay inside the 20×20 live area from (2,2) to (22,22). Outer centerlines normally sit between 3 and 21.
- Rectangles use `rx="2"`. Use approximately six or fewer elements; prioritize legibility at 16px.
- Child elements may only be `path`, `circle`, `rect`, `line`, `polyline`, `polygon`, and `g`.
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
- `category` is one of: `resume`, `ats`, `applications`, `interviews`, `offers-salary`, `layoffs-transition`, `networking`, `remote-work`, `career-growth`, `tools`.
- `tags` and `aliases` are arrays of kebab-case strings. Tags may repeat across icons. A tag or alias may not repeat inside one icon.
- An alias may not match any icon name or another icon's alias.
- `since` is the SemVer version that introduced the icon.
- `animation` names the motion CSS will run when animation is enabled: `draw`, `draw-check`, `nudge-right`, `scan`, `wiggle`, `pop`, or `slide`. The pilot uses `draw` (resume lines), `draw-check`, `pop` (video-interview person), `slide` (salary handles), and `wiggle` (laid-off box).
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
npm run preview:pilot # review contact sheet; Python 3 + Pillow
npm run size        # size-limit; animations.css < 3 KB gzip
npm run site:build  # static docs
```

`validate` checks source SVG/metadata, alias uniqueness, optimized size, and painted stroke bounds
using an expanded viewport. `build` validates first and replaces generated `dist/` with all published
entry points. Root named exports are raw SVG strings (`ResumeIcon`); React entry exports components
with the same names. React remains an optional peer; render/build tools are development dependencies.

`preview:pilot` renders exactly the five pilot icons at 16, 24 and 48px on light/dark backgrounds.
It also shows the two review-only alternatives. Python 3 with Pillow is required; set `PILOT_PYTHON`
to a virtual environment executable if needed. This local preview command is not part of CI.

`size` and `site:build` still print a not-implemented notice until their phases land. CI runs the
other listed checks and does not publish or deploy. No docs site exists yet.

The current pilot is exactly `resume`, `ats-pass`, `video-interview`, `salary-range`, and `laid-off`.
Do not create more icons until the user approves the pilot. Base shapes in `docs/` and alternatives
in `docs/previews/alternatives/` are design references, excluded from package output.

## Commits

[Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/). A scope is required. Allowed scopes: `icons`, `build`, `react`, `site`, `figma`, `docs`, `repo`, `ci`.

```
feat(icons): add offer letter
fix(build): keep viewBox in optimized svg
ci(ci): run size-limit on the react entry
```

Header max length is 100. Husky runs lint-staged, then commitlint.

## Tooling choices

- Biome for format and lint (one tool, no ESLint/Prettier split). Raw SVG artwork is exempt from `noSvgWithoutTitle` because the icon contract forbids title elements. Consumers provide an accessible label or mark decorative icons hidden.
- Vitest for unit tests.
- TypeScript `strict`, plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and `verbatimModuleSyntax`.
- Node `>=20`. CI uses the version in `.nvmrc`.
