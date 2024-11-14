import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .table("stocks")
  .y("Close")
  .color("Symbol")
  .mark("barY");`;

export const partialChartY = (options) =>
  renderPlot("stocks.csv", codeString, options);
