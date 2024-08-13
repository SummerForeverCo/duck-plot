import { defineConfig } from "vite";
import path from "path";

export default defineConfig(({ command }) => {
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
          entry: path.resolve(__dirname, "src/index.ts"), // Your entry file
          name: "DuckPlot", // Global name for UMD/IIFE builds (not used in CJS/ES)
          formats: ["cjs", "es"], // Generate both CommonJS and ES modules
          fileName: (format) => `duck-plot.${format}`, // Output filenames
        },
        minify: false, // Disable minification for easier inspection
        emptyOutDir: true, // Clean the dist directory before building
      },
    };
  }
});
