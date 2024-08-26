import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `
duckplot
  .table("income")
  .x("month")
  .y("consensus_income")
  .facet("validator")
  .color("validator", {type: "categorical"})
  .options({width: 600, height: 800})
  .type("line")
`;

export const facet = (options) => renderPlot("income.csv", codeString, options);
