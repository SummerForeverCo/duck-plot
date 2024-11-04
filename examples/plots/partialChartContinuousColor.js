import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .table("stocks")
  .x("Date")
  .color("High", {domain: [0, 1000], scheme: "oranges"})
  .mark("barY");`;

export const partialChartContinuousColor = (options) =>
  renderPlot("stocks.csv", codeString, options);
