import { renderPlot } from "../util/renderPlotClient.js";
const render = () => console.log("customRender");
const onClick = (event, value) => {};
// This code is both displayed in the browser and executed
const codeString = `duckplot 
    .query("select round(sum(Close), 1) as Close, year(Date) as year, Symbol from stocks group by year, Symbol")
    .table("stocks")
    .y("Close")
    .color("Symbol")
    .mark("pie")
     .options({width: 300, height: 600})
    .config({
        pieLabels: {
            "AAPL": "A",
            "IBM": "I",
            "GOOG": "Google",
            "AMZN": "Amazon",
        },
        customRender
    })
    `;

export const pie = (options) =>
  renderPlot("stocks.csv", codeString, options, onClick, render);
