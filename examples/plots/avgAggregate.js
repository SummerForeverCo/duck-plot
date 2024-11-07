import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `// Implicitly aggregate the values by date
duckplot
  .table("stocks")
  .x("Date")
  .y(["High", "Low"])
  .mark("line")
  .config({
    // Aggregate values by date
    aggregate: "avg"
  })
`;

export const avgAggregate = (options) =>
  renderPlot("stocks.csv", codeString, options);
