import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .table("stocks")  
  .y("High")
  .color("Symbol")
  .config({aggregate: "avg"})  
  .mark("ruleY");`;

export const horizontalAverage = (options) =>
  renderPlot("stocks.csv", codeString, options);
