// https://vitepress.dev/guide/custom-theme
import { h } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import "./style.css";
import DuckPlotFigure from "../../components/DuckPlotFigure.vue";
import CSVPreview from "../../components/CSVPreview.vue";

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    });
  },
  enhanceApp({ app }) {
    app.component("DuckPlotFigure", DuckPlotFigure);
    app.component("CSVPreview", CSVPreview);
  },
} satisfies Theme;
