import { defineConfig } from "vitepress";
import plot from "./markdown-it-plot.js";
import path from "node:path";

import duckplot from "./markdown-it-duckplot.js";
import csvPreview from "./markdown-it-csv.js";
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
      csvPreview(md);
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
          { text: "Getting Started", link: "getting-started" },
        ],
      },
      {
        text: "Data",
        items: [
          { text: "Data transformations", link: "data-transformations" },
          { text: "Specifying columns", link: "/specifying-columns" },
          { text: "Using raw data", link: "" },
        ],
      },
      {
        text: "Charts",
        items: [
          { text: "Using Marks", link: "" },
          { text: "Color", link: "" },
          { text: "Grouped bar charts", link: "" },
          { text: "Percentage charts", link: "" },
          { text: "Partial charts", link: "" },
        ],
      },
      {
        text: "Marks",
        items: [],
      },
      {
        text: "Options",
        items: [],
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
