# Changelog

## 0.3.0

### Changed

- Configurable `animationDuration` in milliseconds on icons and nested providers for default and draw motion, with proportional loop pauses.

- Provider and icon `animationType="default" | "draw"` option, with full-icon drawing for all 200 icons, per-stroke timing, and comparison controls.
- Complete draw strokes for disconnected paths, circles and rounded corners, including `team-meeting` and `promotion`.

- Per-part CSS motion for 196 icons; four icons explicitly stay static with metadata reasons.
- Stable icon and part classes, keyboard focus triggers, 560ms hover cycles and paused loops.
- Original resting SVG pixels preserved; React animation props and optional CSS import retained.
- 200-icon motion review page, browser checks and 40 KB gzip CSS budget.

## 0.2.0

### Added

- `resume` (15): `resume-tailor`, `resume-compare`, `resume-version`, `bullet-point`, `achievement`, `metrics-impact`, `employment-gap`, `references`, `transcript`, `background-check`, `resume-summary`, `resume-sections`, `one-page-resume`, `resume-score`, `cv-international`.
- `applications` (14): `application-sent`, `application-viewed`, `shortlisted`, `rejection`, `withdraw-application`, `deadline`, `job-alert`, `job-match`, `company-research`, `hiring-pipeline`, `application-status`, `job-filters`, `quick-apply-batch`, `application-notes`.
- `interviews` (15): `behavioral-question`, `star-method`, `technical-interview`, `coding-challenge`, `take-home-task`, `case-interview`, `panel-interview`, `onsite-interview`, `thank-you-note`, `interview-feedback`, `group-interview`, `final-round`, `interview-questions`, `interview-notes`, `interview-timer`.
- `offers-salary` (12): `counter-offer`, `offer-letter`, `signing-bonus`, `compare-offers`, `start-date`, `background-cleared`, `bonus`, `retirement-plan`, `health-insurance`, `paid-time-off`, `cost-of-living`, `total-compensation`.
- `career-growth` (12): `career-path`, `mentor`, `upskill`, `career-ladder`, `performance-review`, `side-project`, `raise-request`, `new-role`, `career-milestone`, `leadership`, `skill-gap`, `reskilling`.
- `networking` (10): `coffee-chat`, `cold-outreach`, `personal-brand`, `elevator-pitch`, `job-fair`, `recommendation`, `alumni-network`, `introduction-request`, `event-networking`, `contact-card`.
- `job-types` (12): `full-time`, `part-time`, `contract-job`, `freelance`, `internship`, `entry-level`, `seasonal-job`, `temp-to-hire`, `apprenticeship`, `executive-role`, `gig-work`, `volunteer`.
- `workplace` (15): `four-day-week`, `visa-sponsorship`, `flexible-hours`, `on-site-office`, `commute`, `work-permit`, `relocation-package`, `team-culture`, `onboarding`, `first-day`, `probation-period`, `org-chart`, `manager`, `team-meeting`, `office-badge`.
- `layoffs-transition` (10): `burnout`, `work-life-balance`, `career-break`, `return-to-work`, `resignation`, `two-weeks-notice`, `exit-interview`, `layoff-support`, `job-security`, `mental-health`.
- `industries` (10): `tech-job`, `healthcare-job`, `finance-job`, `education-job`, `design-job`, `marketing-job`, `sales-job`, `engineering-job`, `hospitality-job`, `government-job`.
- `tools` (10): `ai-rewrite`, `ai-suggestion`, `ai-cover-letter`, `ai-match-score`, `ai-coach`, `chrome-extension`, `browser-autofill`, `job-board-sync`, `calendar-sync`, `email-template`.
- `inclusion` (5): `diversity`, `accessibility`, `veteran-friendly`, `parental-leave`, `equal-pay`.

## 0.1.0

### Added

- 60 original outline career icons across ten categories: resume (8), ATS (6), applications (9),
  interviews (9), offers and salary (8), layoffs and transition (7), networking (4), remote work
  (3), career growth (5), and tools (1).
- Hand-authored SVG sources and metadata with searchable titles, tags and collision-free aliases.
- Optimized SVG files, named raw SVG strings, ESM/CJS entries, React components, declarations,
  metadata manifest and SVG sprite.
- Optional React provider, inherited color, size and stroke controls, and opt-in motion with
  reduced-motion support. The outline default is a 2px stroke on the 24px grid.
- Design system, category contact sheets, full light/dark previews and a searchable local docs
  catalog with 16/24/48px previews.
- Contract validation, painted-bound checks, package tests and individual React import size limits.
