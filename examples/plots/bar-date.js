import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .data({ ddb: db, table: "income" })
  .columns({ x: "month", y: "consensus_income"})
  .type("barY");`;

export const barDate = (duckplot) =>
  renderPlot(duckplot, "income.csv", codeString);
