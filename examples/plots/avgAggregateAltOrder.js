import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .table("income")
  .x("month")
  .y(["consensus_income", "execution_income"])
  .mark("barY")
  .config({
    aggregate: "avg"
  })
  `;

export const avgAggregateAltOrder = (options) =>
  renderPlot("income.csv", codeString, options);
