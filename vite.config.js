import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  test: {
    include: ["test/*.{test,spec}.ts"], // Recursively include all .test.ts and .spec.ts files in the test directory
    exclude: ["node_modules", "dist", "cypress"],
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "DuckPlot",
      fileName: (format) => `duck-plot.${format}`,
      formats: ["es", "cjs"],
    },
  },
});
