import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `
duckplot
  .table("income")
  .fx("month")
  .y(["consensus_income", "execution_income"])
  .type("barY")
`;

export const groupedBar = (options) =>
  renderPlot("income.csv", codeString, options);
