import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .table("stocks")
  .x("Date")
  .mark("barY");`;

export const partialChartX = (options) =>
  renderPlot("stocks.csv", codeString, options);
