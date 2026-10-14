# Pilot outline design system

This is the review gate for the first five original career icons. Stop here until the pilot is
approved. These shapes were drawn directly on the grid; no external icon artwork was used.

## Grid and optical size

- Canvas: `viewBox="0 0 24 24"`. No intrinsic width or height.
- Stroke: `2`, `currentColor`, round caps and joins. Fill: `none`.
- Padding: the **painted stroke**, including caps and joins, stays within `(2,2)`–`(22,22)`.
  Ordinary outer centerlines therefore sit between 3 and 21.
- Circular silhouettes: diameter 18 on the centerline, 20 including stroke. Square silhouettes:
  about 16 on the centerline, 18 including stroke. Wide silhouettes: about 18×14 on the centerline,
  20×16 including stroke. Tall documents intentionally use an 18px centerline height.
- Rectangles use a 2px corner radius. Curved paths use equivalent quadratic corners. Half-grid
  positions are allowed for optical balance and modifier checks.
- Aim for six or fewer SVG elements. A path may join related strokes, but does not justify adding
  detail. At 16px the stroke becomes 1.33px; preserve empty space and remove decorative marks.
- No letters or numbers. The salary icon's essential dollar sign is drawn as paths, never text.

## Shared base shapes

![Document, person, laptop, briefcase and chat bubble bases](base-shapes.svg)

The SVG above contains the five bases, left to right, on separate 24×24 cells. It is a design
reference in `docs/`, not five additional package icons. Reuse these coordinates by copying the
relevant geometry into standalone icons; package SVGs have no symbols, IDs or external references.

| Base | Geometry | Reuse rule |
| --- | --- | --- |
| Document | x=5–19, y=3–21; 2px corners; 5×5 folded top-right corner | Resume uses the complete outline. ATS pass interrupts the bottom/right edges to reserve space for its shield. Keep the fold and left edge unchanged. |
| Person | Head at (12,9), r=2; shoulders from (8,15) to (16,15), crest at y=14 | Designed to fit the laptop screen. Head and shoulder gap survives at 16px. |
| Laptop | Screen x=4–20, y=4–17, r=2; base x=3–21, y=17–21 | Screen and base share one edge, with no doubled strokes. Person is centered inside. |
| Briefcase | Body x=3–21, y=7–20, r=2; handle x=8–16, y=3–7 | Reserved for later approved work. Midline and central clasp are optional, not part of this minimal base. |
| Chat bubble | Body x=3–21, y=3–17, 2px corners; tail down to y=21 | Reserved for later approved work. Tail is part of the outline, without fill or overlapping outlines. |

```svg
<!-- Document base: all standalone icons use the same root attributes. -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round">
  <path d="M14 3H7Q5 3 5 5V19Q5 21 7 21H17Q19 21 19 19V8Z"/>
  <path d="M14 3V8H19"/>
</svg>
```

The companion [base-shapes.svg](base-shapes.svg) is the full SVG for all five base geometries.

## Modifiers

Reserve a bottom-right envelope of approximately `(12,12)`–`(21,21)`, including 1px stroke
allowance outside the centerlines but still within the live area. Center small check, x, plus,
clock, arrow or sparkle marks near `(17,17)`, using a roughly 6×6 centerline footprint. A container
such as the ATS shield may expand to a 9×9 footprint. Keep the same stroke weight as the base.

Remove conflicting base segments explicitly; do not hide them with fills, masks or background
colors. Leave visible space between unrelated strokes. A modifier has one meaning, with at most
one simple container. The pilot uses only the shield check; other modifiers await approval.

## Pilot decisions and alternatives

- **Resume:** rounded photo block, two short profile lines and two longer content lines. The photo
  is an empty block so it reads without introducing another miniature person.
- **ATS pass:** the same document fold plus a shield containing a check. Only two content lines
  remain, keeping the lower-right area clear.
- **Video interview:** shared laptop and person, with no camera dot or call controls.
- **Salary range:** two rounded slider handles, broken track behind them and a centered dollar
  sign above. Handles mark a range rather than a single value.
- **Laid off:** open box with a tilted folder and a small plant. A single flap crease establishes
  cardboard without adding a face, brand or distress symbol.

Two review-only variants live in `docs/previews/alternatives/`: `resume-alt.svg` swaps the empty
photo block for a tiny portrait; `laid-off-alt.svg` replaces the plant with a desk mug. Recommend
the primary resume for small-size clarity and the primary laid-off icon for its more distinct
silhouette. The alternatives are deliberately excluded from validation, package build and exports.

## Review and reproduction

Review [the animation loop](previews/pilot-animations.gif) for the five pilot motions, then
[the contact sheet](previews/pilot.png) at its native resolution: actual 16, 24 and 48px
art on both backgrounds, followed by a consistency row on each background and the alternatives.
The review PNG uses labels outside icons; none are part of icon geometry.

Run `npm run preview:pilot` to reproduce it. This development script uses the pinned npm SVG
renderer and Python 3 with Pillow (`python3 -m pip install Pillow`, preferably in a virtual
environment). Set `PILOT_PYTHON` to that environment's Python executable when necessary.

Approval questions: does the fold feel distinctive enough; should the resume photo contain a
portrait; and does the box communicate a layoff rather than moving desks? No further icons should
be drawn until these choices are reviewed.
