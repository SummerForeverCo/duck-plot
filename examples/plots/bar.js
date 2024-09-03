import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .table("taxi")
  .x("date", {label: ""})
  .y("count")
  .color("Borough")
  .options({width: 200, height: 100, color: {label: ""}})
  .config({tip: false})
  .mark("barY");`;

export const barSmallLegend = (options) =>
  renderPlot("taxi.csv", codeString, options);
