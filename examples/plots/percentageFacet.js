import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `
duckplot
  .query("select * from income where validator in (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15)")
  .table("income")
  .x("month")
  .y(["consensus_income", "execution_income"])
  .fy("validator")  
  .options({width: 600, height: 600})
  .mark("barY")
  .config({percent: true})
`;

export const percentageFacet = (options) =>
  renderPlot("income.csv", codeString, options);
