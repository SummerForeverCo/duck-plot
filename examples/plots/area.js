import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `
duckplot
  .table("income")
  .x("month")
  .y(["consensus_income", "execution_income"], {label: "Total income"})
  .mark("areaY")
  .options({color: {legend: false, label: "Income Source"}})
`;

export const area = (options) => renderPlot("income.csv", codeString, options);
