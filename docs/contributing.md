# Contributing

Read [AGENTS.md](../AGENTS.md) before contributing. It is the source of truth for
icon rules, commands and repository conventions. See the [design system](design-system.md)
for the approved visual language.

Use Node.js 20 or newer; `.nvmrc` specifies the version used in CI.

## Browse locally

```sh
npm ci
npm run build
npm run site:dev
```

The [live demo](https://democruit.com/labs/career-icons) searches all 200 icons by name, title,
tag and alias, filters the 14 categories, and previews every icon at 16, 24 or 48px on light or
dark backgrounds. It also includes pilot animations, provider examples and stroke controls.
`npm run animations:dev` opens the local all-icon animation review at `/docs/animations.html`.
`npm run site:build` creates the static site in `site/dist/`; it does not deploy.

## Check changes

```sh
npm run validate
npm run lint
npm run typecheck
npm test
npm run build
npm run size
npm run check:animations
npm run site:build
```

Validation checks the SVG and metadata contract, painted padding and the 1024-byte optimized SVG
limit. Size-limit checks **each of the 200 React imports**, including the shared runtime, under
1KB gzip with React excluded as the peer dependency; animation CSS has a separate 40KB gzip limit.
`npm run check:animations` verifies motion, rest geometry and reduced-motion behavior in Playwright.
After changing motion definitions, use `npm run generate:animations` to regenerate the stylesheet;
`npm run generate:draw` regenerates draw targets, stroke lengths, timing and CSS (requires
Playwright Chromium).

## Review artwork

To reproduce category contact sheets, install Python 3 with Pillow and run
`npm run preview -- resume` (or another category), then `npm run preview -- all` for the full sheet.
Use `npm run preview -- sheets` for the full collection, all categories and similarity comparisons.
Set `PILOT_PYTHON` to your virtual environment's Python if needed. `npm run preview:pilot` preserves
the pilot comparison at strokes 1.5 and 2. Source artwork lives only in `icons/`; review alternatives
under `docs/previews/alternatives/` are excluded from the package.

Draw original geometry; do not copy other icon
sets or include third-party logos. `linkedin-profile` is a generic professional profile card.

## Releases

`npm run release:dry-run` runs preflight checks without uploading.
`npm run release` publishes to npm after checks and creates a version tag.
See [AGENTS.md](../AGENTS.md#commands) for release options and requirements.
Publishing, pushing, tagging and deploying require an explicit user request.
