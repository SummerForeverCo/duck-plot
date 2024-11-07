import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `duckplot
    .query('select * from stocks where year(Date) = 2017')
    .table("stocks")
    .x("Date", {label: "Custom X Label"})
    .y("Close")
    .mark("barY", {stroke: "black", opacity: 0.5})
    .color("Date")
    .options({
        height: 200,
        width: 500,        
        marks: [Plot.ruleY([2000])],
        y: {
            domain: [0, 3500],
            labelArrow: 'none',
            tickFormat: "2s"},
        x: {ticks: []},
        color: {legend: false}
    })
    `;

export const options = (options) =>
  renderPlot("stocks.csv", codeString, options);
