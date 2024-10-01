import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `
duckplot
  .query("select * from income where validator in (1, 2, 3)")
  .table("income")
  .x("month")
  .color("validator")
  .y(["consensus_income", "execution_income"], {label: "Total income"})
  .mark("areaY")
  .options({color: { label: "Income Source"}})
`;

export const areaWithSeriesTransform = (options) =>
  renderPlot("income.csv", codeString, options);
