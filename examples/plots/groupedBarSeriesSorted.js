import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `
duckplot
  .table("medals_by_nationality")
  .fx("nationality")
  .y("value")
  .color("medal")
  .x("medal")
  .mark("barY")
`;

export const groupedBarSeries = (options) =>
  renderPlot("medals_by_nationality.csv", codeString, options);
