import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .table("taxi")
  .x("Borough", {label: "Neighborhood"})
  .y("count")
  .color("Borough")
  .mark("barY")
  .config({xLabelDisplay: false});`;

export const barRotatedAxis = (options) =>
  renderPlot("taxi.csv", codeString, options);
