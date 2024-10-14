import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .table("income")
  .x(["consensus_income", "execution_income"], {label: "Percent income"})
  .y("month", {label: "This long label should be truncated in the tooltip"})
  .mark("barX")
  .options({height: 500})
  .config({percent: true})
  `;

export const percentageBarX = (options) =>
  renderPlot("income.csv", codeString, options);
