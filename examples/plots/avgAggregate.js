import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .table("income")
  .x("month")
  .y(["execution_income", "consensus_income"])
  .mark("barY")
  .config({
    aggregate: "avg",
    interactiveLegend: false
  })
  `;

export const avgAggregate = (options) =>
  renderPlot("income.csv", codeString, options);
