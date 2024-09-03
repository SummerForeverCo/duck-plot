import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `
duckplot
    .table("income")  
    .query('SELECT *, validator::varchar as v FROM income WHERE validator in (2, 3, 4)')
    .fx("month")
  .y("consensus_income")
  .x("v")
  .color("v")
  .mark("barY")
  .options({width: 300})
`;

export const groupedBarExplicit = (options) =>
  renderPlot("income.csv", codeString, options);
