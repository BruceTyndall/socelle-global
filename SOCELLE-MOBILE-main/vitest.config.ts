import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "packages/**/__tests__/**/*.test.ts",
      "packages/**/src/__tests__/**/*.test.ts",
      "packages/**/test/**/*.test.ts",
      "apps/**/__tests__/**/*.test.ts",
      "apps/**/test/**/*.test.ts"
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"]
    }
  }
});
