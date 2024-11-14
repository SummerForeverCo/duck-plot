import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `// Dynamically create categories for each y-color combo
duckplot
  .table("stocks")
  .x("Date")
  .y(["High", "Low"])
  .color("Symbol")
  .mark("line")
`;

export const multiYandSeries = (options) =>
  renderPlot("stocks.csv", codeString, options);
