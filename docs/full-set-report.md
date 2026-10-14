# Full collection design report

The collection contains **60 icons: five approved pilot icons plus 55 new icons**. All geometry
was hand-authored from the local design system, without external icon paths, tracing or logos.
The primary pilot drawings remain selected. The full-set request restores the 2px source and
React default stroke; salary-range's dollar sign was widened to remain legible at that weight.
Existing React controls, provider, optional CSS and pilot motions are preserved.

The request listed 56 new names despite specifying 55 additions and 60 total. `applied-count`
was omitted to preserve the explicit 60-icon target: its stacked-document silhouette overlaps
`resume-template`, and the application-tracker already covers application progress. No icon was
renamed. This is the only omitted name; all other requested names are present.

## Category results

Every category sheet contains actual 16, 24 and 48px artwork on light and dark backgrounds,
plus the five pilot icons at 24px for comparison. Each category was validated, built and visually
reviewed before proceeding. [all.png](previews/all.png) is the final full-set comparison.

| Category | New icons | Preview | Simplifications and review questions |
| --- | --- | --- | --- |
| Resume | resume-edit, resume-check, resume-upload, resume-download, resume-template, cover-letter, portfolio | [resume.png](previews/resume.png) | Pilot fold/photo reused; interrupted outlines leave room for modifiers. No remaining direction choice. |
| ATS | ats-scan, ats-reject, keyword-match, parse-error, ats-score | [ats.png](previews/ats.png) | Scan is one full-width sweep; parse-error uses broken content strokes. Two tag outlines share no copied full path. No remaining direction choice. |
| Applications | job-post, job-search, apply, application-tracker, saved-job, easy-apply, ghosted, waiting-reply, follow-up | [applications.png](previews/applications.png) | applied-count omitted as explained above. Kanban uses one card mark per column. Ghosted uses round dotted strokes; follow-up uses one return arrow. Confirm the omission if you prefer another name to be removed instead. |
| Interviews | interview, phone-screen, ai-interviewer, interview-prep, interview-schedule, tell-me-about-yourself, mock-interview, feedback | [interviews.png](previews/interviews.png) | Interview uses a simple pair of people rather than tiny facial profiles. Feedback has one star instead of several; mock-interview has one repeat arrow instead of two surrounding arrows, which resembled an eye at 16px. No remaining direction choice. |
| Offers and salary | job-offer, offer-accepted, salary, negotiation, pay-transparency, benefits, equity | [offers-salary.png](previews/offers-salary.png) | Handshake omits individual fingers. Banknotes use a hollow denomination medallion; the dollar sign is reserved for salary-range. No remaining direction choice. |
| Layoffs and transition | open-to-work, severance, unemployment-benefits, career-change, warn-notice, seven-day-plan | [layoffs-transition.png](previews/layoffs-transition.png) | WARN uses a plain alert triangle to avoid a cramped exclamation. Seven-day-plan retains seven stroke dots without numerals. Severance uses an angled open door instead of a rounded rectangle that looked like a phone. Open-to-work's plus badge means availability; confirm that association suits your product. |
| Networking | referral, network, recruiter, linkedin-profile | [networking.png](previews/networking.png) | Referral places one directional arrow beneath two people. linkedin-profile is a plain profile card, with no logo or brand artwork. No remaining direction choice. |
| Remote work | remote-job, hybrid, relocation | [remote-work.png](previews/remote-work.png) | Laptop is a compact version of the pilot screen/base, without interior controls. Hybrid shares one central wall between house and building. No remaining direction choice. |
| Career growth | promotion, skills, certificate, career-goal, learning | [career-growth.png](previews/career-growth.png) | Skills has one tab and one socket. Target is three rings; learning reserves space beside the spine for one sparkle. No remaining direction choice. |
| Tools | job-tracker | [tools.png](previews/tools.png) | Clipboard uses three descending progress strokes, distinct from the kanban tracker. No remaining direction choice. |

## Final review

- Uniform 2px strokes, round caps/joins, `none` fill and `currentColor`; no root dimensions.
- Painted artwork stays inside `(2,2)`–`(22,22)`. All icons use at most six SVG primitives;
  intentional dot groups and related strokes share a path.
- Document, person, laptop, briefcase and chat geometry follow the pilot. Small embedded versions
  retain their silhouettes while reducing detail. Modifiers use the lower-right envelope.
- Directional arrows intrinsic to career-change, promotion, negotiation and referral follow the
  object's meaning; they are not status badges and may sit elsewhere.
- No placeholder artwork or review alternatives are exported. The two pilot alternatives remain
  in `docs/previews/alternatives/` for history.
- `animation: "none"` describes static icons without animated parts; labeled drawing parts retain
  their existing opt-in motion. The full-set request did not add new motion designs.

The SVG, metadata, export, React, accessibility-prop and motion tests run locally, alongside lint,
typecheck, the package build, the static site build and per-icon size-limit checks. The docs site
searches the complete collection by title, filename, tags and aliases. Nothing is published or deployed.

## Verification results

- 60 SVG/metadata pairs validated; largest optimized SVG: 397 bytes (limit 1024).
- 14 tests pass, covering the exact inventory, metadata, minimal geometry, exports, React props,
  provider precedence, static/motion metadata and optional CSS. Lint and typecheck pass.
- All 60 React imports pass size-limit: 388–503 bytes gzip including shared runtime, excluding
  the React peer. Animation CSS is 531 bytes gzip (limit 3000).
- Package and static docs builds pass; generated declarations also typecheck independently.
- The local headless browser verified 60 rendered entries, tag/alias search, category filtering,
  empty results, dark backgrounds, 16px sizing and 375px layout, with no browser errors.
