import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `duckplot
    .table("income")
    .columns({ x: "execution_income", y: "consensus_income" })
    .type("dot")   
    `;

export const dot = (options) => renderPlot("income.csv", codeString, options);
