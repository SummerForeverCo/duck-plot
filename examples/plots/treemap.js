import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `duckplot 
    .query("select sum(Close) as Close, Symbol from stocks group by Symbol")
    .table("stocks")    
    .y("Close")
    .color("Symbol")
    .mark("treemap")
    `;

export const treemap = (options) =>
  renderPlot("stocks.csv", codeString, options);
