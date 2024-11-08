import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .table("stocks")
  .x("Close")
  .y("Symbol")
  .config({aggregate: "avg"})
  .mark("barX", {sort: {y: "x", reverse: true, limit: 3}});`;

export const sortYbyX = (options) =>
  renderPlot("stocks.csv", codeString, options);
