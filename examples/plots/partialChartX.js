import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .table("taxi")
  .x("date")
  .mark("barY");`;

export const partialChartX = (options) =>
  renderPlot("taxi.csv", codeString, options);
