import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `duckplot
    .table("income")
    .columns({ x: "execution_income", y: "consensus_income" })
    .type("dot")
    .config({
        xLabel: "Custom X Label",        
        height: 200,
        width: 300,       
        yLabelDisplay: false,
        color: "black",
        r: 1,
        borderColor: "blue"
    })`;

export const options = (options) =>
  renderPlot("income.csv", codeString, options);
