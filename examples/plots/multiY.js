import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `// Add each column as a y series
duckplot
  .table("stocks_pivoted")
  .x("Date")
  .y(["AAPL", "IBM"])
  .mark("areaY")
`;

export const multiY = (options) =>
  renderPlot("stocks_pivoted.csv", codeString, options);
