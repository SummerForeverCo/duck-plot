// https://vitepress.dev/guide/custom-theme
import { h } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import "./style.css";
import PlotFigure from "../../components/PlotFigure.vue";
import PlotRender from "../../components/PlotRender";

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    });
  },
  enhanceApp({ app, router }) {
    app.component("PlotRender", PlotRender);
    app.component("PlotFigure", PlotFigure);
  },
} satisfies Theme;
