import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `duckplot 
    .query("select round(sum(Close), 1) as Close, year(Date) as year, Symbol from stocks group by year, Symbol")
    .table("stocks")
    .y("Close")
    .color("Symbol") // TODO year as color
    .mark("treemap")
    .text("Symbol")
    `;

export const treemap = (options) =>
  renderPlot("stocks.csv", codeString, options);
