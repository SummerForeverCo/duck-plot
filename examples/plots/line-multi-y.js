import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `
duckplot
  .data({ ddb: db, table: "income" })
  .columns({ x: "month", y: ["consensus_income", "execution_income"]})
  .config({yLabel: "Income"})
  .type("line")
`;

export const lineMultiY = (duckplot) =>
  renderPlot(duckplot, "income.csv", codeString);
