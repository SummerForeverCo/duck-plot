import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `duckplot
    .query("select * from income USING sample 100")
    .table("income")
    .x("month")
    .y(["execution_income", "consensus_income"])
    .text("validator")
    .mark("text")    
    `;

export const textWithTransform = (options) =>
  renderPlot("income.csv", codeString, options);
