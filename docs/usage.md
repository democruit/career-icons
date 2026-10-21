# Usage guide

[Browse all 200 icons](https://democruit.com/labs/career-icons) · [Back to README](../README.md)

## React

```jsx
import { ResumeIcon } from "@democruit-labs/career-icons/react";

<ResumeIcon size={24} aria-label="Resume" />;
```

Icons inherit the parent text color. Use `aria-label` when an icon conveys meaning
on its own, or `aria-hidden="true"` when it sits next to a visible label or is decorative.
Component names use PascalCase with an `Icon` suffix: `ats-scan` becomes `AtsScanIcon`.

### Options

| Prop | Default | Purpose |
| --- | --- | --- |
| `size` | `24` | Icon width and height |
| `color` | `"currentColor"` | Stroke color; inherits the parent text color by default |
| `strokeWidth` | `2` | Stroke weight on the 24×24 grid |
| `absoluteStrokeWidth` | `false` | Keep stroke weight constant in pixels as the icon size changes |
| `animate` | `"none"` | `"hover"`, `"always"` or `"none"` |
| `animationType` | `"default"` | Custom part motion or full-icon `"draw"` |
| `animationDuration` | `560` | Motion duration in milliseconds |

Icons also accept standard SVG props.

### Shared defaults

`CareerIconsProvider` configures a group of icons. Icons work without a provider.
Icon props override the nearest provider; nested providers inherit options they don't set.

```jsx
import {
  CareerIconsProvider,
  AtsPassIcon,
} from "@democruit-labs/career-icons/react";
import "@democruit-labs/career-icons/animations.css";

<CareerIconsProvider color="#2563eb" animate="hover" animationDuration={800}>
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
  <ResumeIcon
    animate="hover"
    animationType="draw"
    animationDuration={800}
    aria-hidden="true"
  />
  View resume
</button>;
```

A `ci-hover` class lets an ancestor trigger hover motion. Keyboard focus also triggers motion
when the icon, the ancestor or a descendant of that ancestor matches `:focus-visible`.
Animations honor `prefers-reduced-motion: reduce`; icons stay static without the stylesheet
or with `animate="none"`.

### Timing

`animationDuration` sets the motion duration in milliseconds for both `default` and `draw`.
It inherits through nested providers; icon props take precedence. With `animate="always"`,
the pause lasts twice the motion duration (800ms motion + 1600ms pause in the example).
Use a non-negative finite number; zero completes immediately and invalid values fall back to
560ms. Raw SVG consumers can set `--ci-animation-duration: 800ms` in CSS.

## SVG and other formats

React is an optional peer dependency. The main entry provides raw SVG strings and
metadata with no runtime dependencies. JavaScript entries support ESM and CommonJS
and are tree-shakeable; the animation stylesheet is opt-in.

All icons use a 24×24 grid, a 2px stroke, round caps and joins, and `currentColor`.

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

