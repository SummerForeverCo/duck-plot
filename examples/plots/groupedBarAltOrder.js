import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `
duckplot
  .table("income")
  .fx("month")
  .y(["execution_income", "consensus_income"])
  .mark("barY")
`;

export const groupedBarAltOrder = (options) =>
  renderPlot("income.csv", codeString, options);
