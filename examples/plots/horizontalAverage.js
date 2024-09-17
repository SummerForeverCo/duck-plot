import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .table("taxi")  
  .y("count")
  .color("Borough")
  .config({aggregate: "avg"})  
  .mark("ruleY");`;

export const barSmallLegend = (options) =>
  renderPlot("taxi.csv", codeString, options);
