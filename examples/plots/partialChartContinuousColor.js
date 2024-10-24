import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .table("taxi")
  .x("date")
  .color("count", {domain: [0, 1000], scheme: "oranges"})  
  .mark("barY");`;

export const partialChartContinuousColor = (options) =>
  renderPlot("taxi.csv", codeString, options);
