import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `
duckplot
  .table("income")
  .columns({ x: "month", y: "consensus_income"})
  .type("line")
`;

export const line = (options) => renderPlot("income.csv", codeString, options);
