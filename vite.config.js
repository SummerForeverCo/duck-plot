import { defineConfig } from "vite";
// import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from "path";

// export default defineConfig({
//   plugins: [nodePolyfills()],
//   build: {
//     lib: {
//       entry: path.resolve(__dirname, "src/index.ts"),
//       name: "PlotFit",
//       fileName: (format) => `duck-plot.${format}`,
//       formats: ["es", "cjs"],
//     },
//   },
// });
// // vite.config.js
// import { defineConfig } from "vite";
// import path from "path";
// // TODO: Remove this dep if it doesn't work
// import nodePolyfills from "vite-plugin-node-polyfills";
// import NodePolyfillPlugin from "node-polyfill-webpack-plugin";

export default defineConfig({
  test: {
    include: ["test/*.{test,spec}.ts"], // Recursively include all .test.ts and .spec.ts files in the test directory
    exclude: ["node_modules", "dist", "cypress"],
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "PlotFit",
      fileName: (format) => `duck-plot.${format}`,
      formats: ["es", "cjs"],
    },
  },
  // rollupOptions: {
  //   plugins: [NodePolyfillPlugin()],
  // },
  // // Enables node:* packages
  // plugins: [nodePolyfills()],

  // For running the dev
  //   server: {
  //     port: 8008,
  //     open: "/",
  //   },
});
