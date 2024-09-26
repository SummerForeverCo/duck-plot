import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `duckplot
    .query('select *, execution_income as fake_column from income USING sample 100')
    .table("income")
    .x("month")
    .y(["execution_income", "consensus_income"])
    .color("validator")
    .text("month")
    .mark("text")    
    `;

export const textWithSeriesTransform = (options) =>
  renderPlot("income.csv", codeString, options);
