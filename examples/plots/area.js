import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `
duckplot
  .table("income")
  .x("month")
  .y(["consensus_income", "execution_income"])
  .type("areaY")
  .options({color: {label: "Income Source"}})
`;

export const area = (options) => renderPlot("income.csv", codeString, options);
