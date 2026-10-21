# Career Icons by Democruit

**200 original career-themed outline SVG icons**, built and maintained by
**[Democruit](https://democruit.com)**. Designed for job boards, career platforms and products
that help people find their next opportunity. The collection spans **14 categories**.

24×24 grid · 2px stroke · round caps and joins · `currentColor` · no runtime dependencies in the
raw SVG entry · React is an optional peer.

[Live demo](https://democruit.com/labs/career-icons) · [Design system](docs/design-system.md)

- React components with TypeScript declarations, shared provider defaults and configurable size,
  color and stroke width.
- Opt-in default motions for 196 icons and full-icon draw animations for all 200, with configurable
  duration and reduced-motion support.
- Tree-shakeable ESM and CommonJS entries, raw SVG strings, standalone SVG files, a sprite and
  searchable metadata.

## Install and use

```sh
npm install @democruit-labs/career-icons
```

```jsx
import { ResumeIcon, JobSearchIcon } from "@democruit-labs/career-icons/react";

<ResumeIcon size={24} aria-label="Resume" />;
<JobSearchIcon size={16} aria-hidden="true" />; // next to a visible text label
```

Icons inherit the parent color. The React defaults are `size={24}`, `strokeWidth={2}`,
`color="currentColor"`, `animate="none"`, `animationType="default"`, `animationDuration={560}`,
and `absoluteStrokeWidth={false}`. `CareerIconsProvider`
sets shared defaults; icon props override the provider. `absoluteStrokeWidth` keeps a selected
stroke weight constant in pixels when the icon size changes.

```jsx
import { CareerIconsProvider, AtsPassIcon } from "@democruit-labs/career-icons/react";
import "@democruit-labs/career-icons/animations.css"; // optional; honors reduced motion

<CareerIconsProvider size={24} color="#2563eb" animate="hover" animationDuration={800}>
  <AtsPassIcon aria-label="ATS approved" />
  <AtsPassIcon animationDuration={400} aria-label="Faster ATS approval" />
</CareerIconsProvider>;
```

## Animations

Motion is opt-in through the CSS import and `animate` prop (`hover`, `always`, `none`).
`animationType="default"` uses each icon's custom part motion: 196 icons have default motions;
four remain static in this mode. Metadata identifies these with `animation: "none"` and an
`animationReason`. `animationType="draw"` draws the full icon and is available for all 200 icons,
including those four.

```jsx
import { ResumeIcon } from "@democruit-labs/career-icons/react";
import "@democruit-labs/career-icons/animations.css";

<button type="button" className="ci-hover">
  <ResumeIcon animate="hover" animationType="draw" animationDuration={800} aria-hidden="true" />
  View resume
</button>;
```

A `ci-hover` class lets an ancestor trigger hover motion. Keyboard focus also triggers motion
when the icon, the ancestor or a descendant of that ancestor matches `:focus-visible`.
Animations honor `prefers-reduced-motion: reduce`; icons stay static without the stylesheet
or with `animate="none"`.
`animationDuration` sets the motion duration in milliseconds for both `default` and `draw`.
It inherits through nested providers; icon props take precedence. With `animate="always"`,
the pause lasts twice the motion duration (800ms motion + 1600ms pause in the example).
Use a non-negative finite number; zero completes immediately and invalid values fall back to
560ms. Raw SVG consumers can set `--ci-animation-duration: 800ms` in CSS.

| Import | Contents |
| --- | --- |
| `@democruit-labs/career-icons` | Named SVG strings, such as `ResumeIcon`, searchable `icons` records, and `version` |
| `@democruit-labs/career-icons/react` | Named React components and provider |
| `@democruit-labs/career-icons/svg/resume.svg` | Optimized standalone SVG |
| `@democruit-labs/career-icons/sprite.svg` | All 200 symbols, identified by kebab-case names |
| `@democruit-labs/career-icons/icons.json` | Titles, categories, search tags, aliases, version and motion metadata |
| `@democruit-labs/career-icons/animations.css` | Optional motion stylesheet |

The installed npm package version is available from the main entry (injected at build time from
`package.json`):

```ts
import { version } from "@democruit-labs/career-icons";
```

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

## Develop

```sh
npm run validate
npm run lint
npm run typecheck
npm test
npm run build
npm run size
npm run check:animations
npm run site:build
npm run release:dry-run   # preflight publish (no upload)
npm run release           # publish to npm after CI checks; see AGENTS.md
```

Validation checks the SVG and metadata contract, painted padding and the 1024-byte optimized SVG
limit. Size-limit checks **each of the 200 React imports**, including the shared runtime, under
1KB gzip with React excluded as the peer dependency; animation CSS has a separate 40KB gzip limit.
`npm run check:animations` verifies motion, rest geometry and reduced-motion behavior in Playwright.
After changing motion definitions, use `npm run generate:animations` to regenerate the stylesheet;
`npm run generate:draw` regenerates draw targets, stroke lengths, timing and CSS (requires
Playwright Chromium).

To reproduce category contact sheets, install Python 3 with Pillow and run
`npm run preview -- resume` (or another category), then `npm run preview -- all` for the full sheet.
Use `npm run preview -- sheets` for the full collection, all categories and similarity comparisons.
Set `PILOT_PYTHON` to your virtual environment's Python if needed. `npm run preview:pilot` preserves
the pilot comparison at strokes 1.5 and 2. Source artwork lives only in `icons/`; review alternatives
under `docs/previews/alternatives/` are excluded from the package.

Read [AGENTS.md](AGENTS.md) before contributing. Draw original geometry; do not copy other icon
sets or include third-party logos. `linkedin-profile` is a generic professional profile card.

## License

[MIT](LICENSE).
