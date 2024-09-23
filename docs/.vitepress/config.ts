import { defineConfig } from "vitepress";
import plot from "./markdown-it-plot.js";
import path from "node:path";

import duckplot from "./markdown-it-duckplot.js";
// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "DuckPlot",
  vite: {
    resolve: {
      alias: [
        {
          find: "@summerforeverco/duck-plot",
          replacement: path.resolve("../dist/index.js"),
        },
      ],
    },
  },
  description: "DockPlot docs",
  markdown: {
    config: (md) => {
      plot(md);
      duckplot(md);
    },
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Examples", link: "/markdown-examples" },
    ],

    sidebar: [
      {
        text: "Examples",
        items: [{ text: "Getting Started", link: "/api-examples" }],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/vuejs/vitepress" },
    ],
  },
});
