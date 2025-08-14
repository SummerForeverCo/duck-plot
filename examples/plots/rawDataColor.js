import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `duckplot
  .rawData([{col1: "a", col2: 5}, {col1: "b", col2: 2}, {col1: "c", col2: 3}], {col1: "string", col2: "number"})
  .x("col1")
  .y("col2")
  .color("blue")  
  .mark("barY")
`;

export const rawDataColor = (options) =>
  renderPlot("stocks.csv", codeString, options);
