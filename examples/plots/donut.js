import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `duckplot 
    .query("select round(sum(Close), 1) as Close, year(Date) as year, Symbol from stocks group by year, Symbol ORDER BY Close DESC")
    .table("stocks")
    .y("Close")
    .color("Symbol")
    .mark("pie")
    .options({width: 400, height: 400})
    .config({
        donut: true,
        pieLabels: {
            "AAPL": "A",
            "IBM": "I",
            "GOOG": "G",
            "AMZN": "A",
        }
    })
    `;

export const donut = (options) => renderPlot("stocks.csv", codeString, options);
