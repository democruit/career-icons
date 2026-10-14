import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

test("package is the public scoped career icon library", () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as {
    name: string;
    sideEffects: boolean;
    publishConfig: { access: string };
    exports: Record<string, unknown>;
    peerDependenciesMeta: { react: { optional: boolean } };
  };

  expect(pkg.name).toBe("@democruit/career-icons");
  expect(pkg.sideEffects).toBe(false);
  expect(pkg.publishConfig.access).toBe("public");
  expect(pkg.exports).toHaveProperty(".");
  expect(pkg.exports).toHaveProperty("./react");
  expect(pkg.exports).toHaveProperty("./svg/*");
  expect(pkg.peerDependenciesMeta.react.optional).toBe(true);
});
