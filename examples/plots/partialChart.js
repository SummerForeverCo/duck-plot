import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .table("taxi")
  .columns({ x: "date", series: "Borough"})  
  .type("barY");`;

export const partialChart = (options) =>
  renderPlot("taxi.csv", codeString, options);
