import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `
duckplot
  .table("income")
  .x("validator")
  .y(["consensus_income", "execution_income"])
  .type("barYGrouped")
`;

export const groupedBar = (options) =>
  renderPlot("income.csv", codeString, options);
