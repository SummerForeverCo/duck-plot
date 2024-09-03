import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .table("taxi")
  .x("date")
  .y("count")
  .color("Borough")  
  .mark("line");`;

export const barWide = (options) => renderPlot("taxi.csv", codeString, options);
