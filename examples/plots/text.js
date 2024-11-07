import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `duckplot
    .query('select * from stocks limit 20')
    .table("stocks")
    .x("Date")
    .y("Close")
    .color("Symbol")
    .text("Close")
    // This is a nice trick to format the value!
    .mark("text", {text: d => Math.floor(d.text)})
    `;

export const text = (options) => renderPlot("stocks.csv", codeString, options);
