import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .table("income")
  .columns({ x: "month", y: "consensus_income", series: "month"})
  .type("barY")
  .config({legendLabel: "Date", hideTicks: true})
  .color({scheme: "blues"})
  `;

export const barDate = (options) =>
  renderPlot("income.csv", codeString, options);
