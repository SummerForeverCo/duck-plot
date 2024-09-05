import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `duckplot
    .table("income")
    .x("execution_income")
    .y("consensus_income")
    .mark("dot", {r: 2, opacity: .1})
    `;

export const dot = (options) => renderPlot("income.csv", codeString, options);
