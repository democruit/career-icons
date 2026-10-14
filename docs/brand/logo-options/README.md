# Logo mark options — review only

Four original, hand-authored directions for `@democruit/career-icons`. None is selected or wired
into the package, docs site, existing README, or published assets.

[Open the full comparison](preview.png) at native resolution to judge the 16px marks.

| Option | Rationale | Tradeoff |
| --- | --- | --- |
| [1 — Spark clasp](option-1/mark-outline.svg) | A rounded briefcase makes the career theme immediate. Its four-point spark replaces the clasp and adds a craft cue. The solid version opens that spark into a generous knockout. | The briefcase is a familiar symbol; the spark does the distinguishing work. |
| [2 — Career quartet](option-2/mark-outline.svg) | Document, briefcase, person, and check share a compact 2×2 arrangement. It describes an icon collection rather than a single career tool. | Four separate silhouettes create the busiest 16px mark; the miniature document fold disappears in the solid reduction. |
| [3 — Growth fold](option-3/mark-outline.svg) | An upward-right arrow occupies the document's folded corner. The open corner makes progress part of the silhouette, while the blank page avoids decorative content lines. | It can suggest a resume or document product more strongly than an icon set. |
| [4 — Checked case](option-4/mark-outline.svg) | A rounded square frames a briefcase and check. The solid version uses a filled frame with a knocked-out case and a filled check to retain a clear interior at small sizes. | The app frame is familiar and less distinctive; the outline check becomes subtle at 16px. |

**Recommendation: option 1.** It combines the simplest career silhouette with one memorable
detail. Its solid version remains recognizable at 16px without a surrounding app frame.
Option 2 is the stronger alternative when communicating “a collection of icons” is the priority.

Each `option-n/` contains:

- `mark-outline.svg`: 24×24, 2px `currentColor` stroke, round caps/joins, no fill.
- `mark-solid.svg`: independently drawn 32×32 filled `currentColor` geometry; true transparent
  knockouts where needed. Use this version for small favicons and avatars.
- `avatar.png`: 256×256, white solid mark on a blue rounded square, transparent outer corners.
- `github-social-preview.png`: 1280×640 provisional social image, identical layout for comparison.
- `lockup-preview.png`: three horizontal pairings with the exact `career-icons` wordmark in
  Geist Sans Medium, shown in slate on light, blue on white, and white on blue.

The 2688×5960 `preview.png` includes both mark versions for all four options at **16, 32, 64,
and 256 actual pixels**, on slate/light, blue/white, white/dark, and white/brand-blue combinations.
It also includes all avatars, four social mocks at their full 1280×640 dimensions, and the lockup
studies. Brand blue is `#2563EB`, slate and dark are `#0F172A`, and light is `#F8FAFC`.

All eight SVGs were optimized using the repository's configuration from `scripts/icons.mjs`:
SVGO `preset-default` plus `removeDimensions`. Each is below 2 KB and has no IDs, inline styles,
text, hardcoded colors, or raster content. Outline painted bounds were checked against the
design system's `(2,2)`–`(22,22)` live area. Solid marks and their negative spaces were reviewed
at native 16px sampling, including an enlarged nearest-neighbor inspection.

PNG layouts were rendered locally from the SVGs with the repository's Resvg renderer. The
wordmark preview uses paths converted from the installed `@fontsource/geist-sans` Medium font;
no substitute font or generated lettering was used. Final lockup SVGs and optical spacing are
deferred until an option is chosen. The path conversion is already demonstrated in these PNG
studies; no provisional lockup SVG is presented as a final asset.

The requested `imagegen-cli` performed local PNG optimization, preserving the native sizes:

```bash
npm run imagegen -- optimize \
  --in /tmp/career-logo-fonts/preview.png \
  --out /Users/ardazaman/Documents/Projects/democruit/career-icons/docs/brand/logo-options/preview.png \
  --format png --no-resize
```

The same command's `--in-dir` / `--out-dir` mode finalized the three PNGs in each option folder.
These commands run from the sibling `imagegen-cli` repository. No generation/edit API calls
were used, and no existing output required `--force`.

**Stopped for review.** No existing assets were replaced, and nothing was pushed, published,
or deployed. Selection and the final path-based horizontal lockup are the next stage.
