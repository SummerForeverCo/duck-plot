import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .data({ ddb: db, table: "income" })
  .columns({ x: "month", y: "consensus_income", series: "month"})
  .type("barY")
  .config({legendLabel: "Date"})
  `;

export const barDate = (duckplot) =>
  renderPlot(duckplot, "income.csv", codeString);
