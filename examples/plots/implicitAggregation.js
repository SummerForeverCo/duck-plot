import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `// Explicitly take the avg of the values by date
duckplot
  .table("stocks")
  .x("Date")
  .y(["High", "Low"])
  .mark("line")
`;

export const implicitAggregation = (options) =>
  renderPlot("stocks.csv", codeString, options);
