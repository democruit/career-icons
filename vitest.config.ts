import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    hookTimeout: 60000,
    testTimeout: 60000,
    include: ["tests/**/*.test.{ts,mjs}"],
  },
});
