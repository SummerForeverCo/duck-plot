import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `
duckplot
  .table("income")
  .x("month")
  .y("consensus_income")
  .fy("validator")
  .color("validator", {type: "categorical"})
  .options({width: 600, height: 800})
  .mark("line")
`;

export const fy = (options) => renderPlot("income.csv", codeString, options);
