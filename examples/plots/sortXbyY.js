import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .table("stocks")
  .x("Symbol")
  .y("Close")
  .config({aggregate: "avg"})
  .mark("barY", {sort: {x: "y", reverse: true, limit: 3}});`;

export const sortXbyY = (options) =>
  renderPlot("stocks.csv", codeString, options);
