/** @type {import("@commitlint/types").UserConfig} */
export default {
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
      ],
    ],
    "type-empty": [2, "never"],
    "scope-enum": [2, "always", ["icons", "build", "react", "site", "figma", "docs", "repo", "ci"]],
    "scope-empty": [2, "never"],
  },
};
