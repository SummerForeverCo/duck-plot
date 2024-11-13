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
        text: "Introduction",
        items: [
          { text: "Motivation", link: "/motivation" },
          { text: "Getting Started", link: "/getting-started" },
        ],
      },
      {
        text: "Data",
        items: [
          {
            text: "Transformations",
            link: "/data-transformations",
          },
          { text: "Queries", link: "/queries" },
          { text: "Using raw data", link: "/raw-data" },
        ],
      },
      {
        text: "Charts",
        items: [
          { text: "Configuring charts", link: "/configuring-charts" },
          { text: "Color", link: "/color" },
          { text: "Specialized charts", link: "/specialized-charts" },
        ],
      },
      {
        text: "Interactions",
        items: [
          {
            text: "Legends",
            link: "",
          },
          {
            text: "Tooltips",
            link: "",
          },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/vuejs/vitepress" },
    ],
  },
});
