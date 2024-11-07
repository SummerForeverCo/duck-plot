import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .table("stocks")
  .x("Date")
  .color("Symbol")
  .mark("barY");`;

export const partialChart = (options) =>
  renderPlot("stocks.csv", codeString, options);
