import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `duckplot 
    .query("select round(sum(Close), 1) as Close, year(Date) as year, Symbol from stocks group by year, Symbol")
    .table("stocks")
    .y("Close")
    .color("Symbol")
    .mark("circlePack")
    .options({width: 500, height: 500})
    .text("year")
    `;

export const circlePack = (options) =>
  renderPlot("stocks.csv", codeString, options);
