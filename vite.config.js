import { defineConfig } from "vite";
import path from "path";

export default defineConfig(({ command, mode }) => {
  if (command === "serve") {
    // Dev server specific config
    return {
      root: path.resolve(__dirname, "examples"),
      server: {
        port: 8008,
        open: "/",
      },
    };
  } else {
    // Build specific config
    return {
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
    };
  }
});
