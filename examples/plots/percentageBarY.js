import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .table("stocks_pivoted")
  .x("Date", {label: "This long label should be truncated in the tooltip"})
  .y(["AAPL", "IBM"])
  .mark("barY")
  .config({percent: true})
  `;

export const percentageBarY = (options) =>
  renderPlot("stocks_pivoted.csv", codeString, options);
