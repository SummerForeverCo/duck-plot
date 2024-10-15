import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `
duckplot
  .query("select * from income where validator in ('1', '2', '3')")
  .table("income")
  .fx("month")
  .y(["consensus_income"])
  .color(["validator"])
  .x(["validator"])
  .mark("barY")
  .options()
`;

export const groupedBarWithSeries = (options) =>
  renderPlot("income.csv", codeString, options);
