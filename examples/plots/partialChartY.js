import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .table("taxi")
  .y("count")
  .color("Borough")  
  .mark("barY");`;

export const partialChartY = (options) =>
  renderPlot("taxi.csv", codeString, options);
