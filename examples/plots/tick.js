import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `duckplot
    .table("stocks")
    .x("Date")    
    .fy("Symbol")
    .color("Close")   
    .mark("tickX")
    `;

export const tick = (options) => renderPlot("stocks.csv", codeString, options);
