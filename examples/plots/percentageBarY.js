import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .table("income")
  .x("month", {label: "This long label should be truncated in the tooltip"})
  .y(["consensus_income", "execution_income"], {label: "Percent income"})
  .mark("barY")
  .config({percent: true})
  `;

export const percentageBarY = (options) =>
  renderPlot("income.csv", codeString, options);
