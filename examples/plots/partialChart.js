import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .table("taxi")
  .x("date")
  .color("Borough")  
  .mark("barY");`;

export const partialChart = (options) =>
  renderPlot("taxi.csv", codeString, options);
