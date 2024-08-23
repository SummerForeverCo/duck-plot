import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .table("taxi")
  .columns({ x: "date", y: "count", series: "Borough"})
  .config({width: 200, height: 100, xLabel: '', legendLabel: "", tip: false})
  .type("barY");`;

export const barSmallLegend = (options) =>
  renderPlot("taxi.csv", codeString, options);
