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
scripts/                  validate, build, figma export
dist/                     generated package output (gitignored)
site/                     static docs site
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

`sideEffects` is `false`. `publishConfig.access` is `"public"`. Only `dist/` is published.

Component names are PascalCase plus an `Icon` suffix. `ats-scan.svg` becomes `AtsScanIcon`. Filenames stay kebab-case.

Outline is the only style in 0.1.0. Keep the default export names stable so a later filled style can be added as extra files and extra exports (for example `AtsScanFilledIcon`) without renaming outline icons.

## Icon contract

Each icon is a pair: `icons/<name>.svg` and `icons/<name>.json`.

SVG:

- Root `<svg viewBox="0 0 24 24">` with `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, `stroke-linecap="round"`, `stroke-linejoin="round"`.
- No `width` or `height` attributes (SVGO strips dimensions and keeps `viewBox`).
- 2px padding. Drawn geometry stays inside the 20×20 live area from (2,2) to (22,22).
- Child elements may only be `path`, `circle`, `rect`, `line`, `polyline`, `polygon`, and `g`.
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
  "since": "0.1.0"
}
```

- `name` matches the filename and is unique.
- `title` is the human label.
- `category` is one of: `resume`, `ats`, `applications`, `interviews`, `offers-salary`, `layoffs-transition`, `networking`, `remote-work`, `career-growth`, `tools`.
- `tags` and `aliases` are arrays of kebab-case strings. Tags may repeat across icons. A tag or alias may not repeat inside one icon.
- An alias may not match any icon name or another icon's alias.
- `since` is the SemVer version that introduced the icon.
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
npm run size        # size-limit; one React icon < 1 KB gzip
npm run site:build  # static docs
```

`validate`, `build`, `size`, and `site:build` print a not-implemented notice until their phase lands. CI runs the same commands and does not publish or deploy.

## Commits

[Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/). A scope is required. Allowed scopes: `icons`, `build`, `react`, `site`, `figma`, `docs`, `repo`, `ci`.

```
feat(icons): add offer letter
fix(build): keep viewBox in optimized svg
ci(ci): run size-limit on the react entry
```

Header max length is 100. Husky runs lint-staged, then commitlint.

## Tooling choices

- Biome for format and lint (one tool, no ESLint/Prettier split).
- Vitest for unit tests.
- TypeScript `strict`, plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and `verbatimModuleSyntax`.
- Node `>=20`. CI uses the version in `.nvmrc`.
