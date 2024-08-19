import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `
duckplot
  .table("income")
  .columns({ x: "month", y: ["consensus_income", "execution_income"]})
  .config({yLabel: "Income"})
  .type("line")
  .color(["purple", "green"])
`;

export const lineMultiY = (options) =>
  renderPlot("income.csv", codeString, options);
