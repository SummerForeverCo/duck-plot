import { defineConfig } from "vitepress";
import plot from "./markdown-it-plot.js";
import path from "node:path";

import duckplot from "./markdown-it-duckplot.js";
// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/duck-plot/",
  title: "DuckPlot",
  description: "DuckPlot documentation",
  vite: {
    resolve: {
      alias: [
        {
          find: "@summerforeverco/duck-plot",
          replacement: path.resolve(__dirname, "../../dist/index.es"),
        },
        {
          find: "@summerforeverco/tmp/dist/style.css",
          replacement: path.resolve(__dirname, "../../dist/style.css"),
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
    nav: [{ text: "Home", link: "/" }],
    search: {
      provider: "local",
    },
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
            link: "/legends",
          },
          {
            text: "Tooltips",
            link: "/tooltips",
          },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/summerforeverco/duck-plot" },
    ],
  },
});
