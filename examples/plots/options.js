import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `duckplot
    .data({ ddb: db, table: "income" })
    .columns({ x: "execution_income", y: "consensus_income" })
    .type("dot")
    .config({
        xLabel: "Custom X Label",        
        height: 100,
        width: 300,       
        yLabelDisplay: false,
        color: "black",
        r: 1
    })`;

export const options = (duckplot) =>
  renderPlot(duckplot, "income.csv", codeString);
