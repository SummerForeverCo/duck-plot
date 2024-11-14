import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `// Add each column as a y series
duckplot
  .table("stocks_pivoted")
  .x("Date")
  .y(["IBM", "AAPL"])
  .mark("areaY")
`;

export const multiYReordered = (options) =>
  renderPlot("stocks_pivoted.csv", codeString, options);
