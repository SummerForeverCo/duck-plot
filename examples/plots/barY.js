import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .query('select * from stocks where year(Date) = 2017 AND month(Date) = 1')
  .table("stocks")
  .x("Date")
  .y("Close")
  .color("Symbol")
  .mark("barY", {stroke: "black"});`;

export const barY = (options) => renderPlot("stocks.csv", codeString, options);
