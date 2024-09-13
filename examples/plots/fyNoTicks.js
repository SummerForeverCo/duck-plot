import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `
duckplot
  .table("income")
  .x("month", {ticks:[]})
  .y("consensus_income", {ticks:[]})
  .fy("validator", {ticks:[]})
  .color("validator", {type: "categorical"})
  .options({width: 600, height: 200})
  .mark("line")
`;

export const fyNoTicks = (options) =>
  renderPlot("income.csv", codeString, options);
