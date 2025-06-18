import { defineConfig } from "vite";
import path from "path";
import dts from "vite-plugin-dts";

export default defineConfig(({ command, mode }) => {
  if (mode === "test") {
    return {};
  }
  if (command === "serve") {
    return {
      root: path.resolve(__dirname, "examples"),
      server: {
        port: 8008,
        open: "/",
      },
      optimizeDeps: {
        exclude: ["@mapbox"],
      },
    };
  } else {
    return {
      build: {
        lib: {
          entry: path.resolve(__dirname, "src/index.ts"),
          name: "DuckPlot",
          formats: ["cjs", "es"],
          fileName: (format) =>
            format === "es" ? `index.${format}.js` : `index.${format}`,
        },
        minify: false,
        emptyOutDir: true,
      },
      plugins: [
        dts({
          outputDir: "dist",
          rollupTypes: true,
          insertTypesEntry: true, // Add this to create an entry point for types
        }),
      ],
    };
  }
});
