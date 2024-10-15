import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `
duckplot
  .query("select *, year(month) as year from income where year=2024 and validator in ('1', '2', '3')")
  .table("income")
  .fx("month")
  .y(["consensus_income", "execution_income"])
  .color(["validator"])
  .mark("barY")
  .options()
`;

export const groupedBarWithYandSeries = (options) =>
  renderPlot("income.csv", codeString, options);
