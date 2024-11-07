import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `duckplot
    .table("stocks")
    .x("Date")
    .y("Close")
    .color("Symbol")
    .r("Close")
    .mark("dot", {opacity: .3})
    `;

export const dot = (options) => renderPlot("stocks.csv", codeString, options);
