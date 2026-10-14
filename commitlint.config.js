/** @type {import("@commitlint/types").UserConfig} */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [2, "always", ["icons", "build", "react", "site", "figma", "docs", "repo", "ci"]],
    "scope-empty": [2, "never"],
    "header-max-length": [2, "always", 100],
  },
};
