import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `duckplot
    .table("income")
    .x("execution_income", {label: "Custom X Label"})
    .y("consensus_income")    
    .mark("dot")
    .options({
        height: 200,
        width: 300,
        color: "black"
    })
    .config({
        xLabelDisplay: false,
        r: 1,
    })`;

export const options = (options) =>
  renderPlot("income.csv", codeString, options);
