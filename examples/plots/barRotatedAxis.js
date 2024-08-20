import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .table("taxi")
  .columns({ x: "Borough", y: "count"})  
  .type("barY");`;

export const barRotatedAxis = (options) =>
  renderPlot("taxi.csv", codeString, options);
