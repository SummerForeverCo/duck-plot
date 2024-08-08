import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `duckplot
    .data({ ddb: db, table: "income" })
    .columns({ x: "execution_income", y: "consensus_income" })
    .type("dot")`;

export const dot = (duckplot) => renderPlot(duckplot, "income.csv", codeString);
