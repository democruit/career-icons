# Career Icons by Democruit

**200 original outline icons for careers and job search**, built and maintained by
**[Democruit](https://democruit.com)**.

Made for job boards, resume builders and career platforms. Find icons for resumes,
interviews, salary, remote work and more across 14 categories.

[Browse the icons →](https://democruit.com/labs/career-icons)

- A consistent outline style that stays clear at small sizes.
- React components you can customize with size and color.
- Optional animations, with reduced-motion support.
- SVG files for use in any framework or design tool.

## Get started

```sh
npm install @democruit-labs/career-icons
```

Import an icon and use it in your React app:

```jsx
import { ResumeIcon } from "@democruit-labs/career-icons/react";

export function ViewResume() {
  return (
    <button type="button">
      <ResumeIcon aria-hidden="true" />
      View resume
    </button>
  );
}
```

Icons are 24px by default and inherit the surrounding text color. Set `size` or
`color` to customize them:

```jsx
<ResumeIcon size={32} color="#2563eb" aria-label="Resume" />
```

## Add animation

Import the stylesheet once, then choose when an icon animates:

```jsx
import { ResumeIcon } from "@democruit-labs/career-icons/react";
import "@democruit-labs/career-icons/animations.css";

<ResumeIcon animate="hover" aria-label="Resume" />
```

Use `animate="always"` to loop, or add `animationType="draw"` for a drawing effect.
Animations respect the user's reduced-motion preference.

## Learn more

- [Usage guide](https://github.com/democruit/career-icons/blob/main/docs/usage.md) —
  all React options, shared defaults, animations and SVG imports.
- [Design system](https://github.com/democruit/career-icons/blob/main/docs/design-system.md) —
  the collection's visual style and drawing guidelines.
- [Contributing](https://github.com/democruit/career-icons/blob/main/docs/contributing.md) —
  local previews, development and checks.

Built and maintained by [Democruit](https://democruit.com). Licensed under
[MIT](https://github.com/democruit/career-icons/blob/main/LICENSE).
