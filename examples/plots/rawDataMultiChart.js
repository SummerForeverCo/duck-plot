import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `
const rawData = [
  {col1: "a", col2: 5, mark: "line"},
  {col1: "b", col2: 2, mark: "line"},
  {col1: "c", col2: 3, mark: "line"},
  {col1: "a", col2: 10, mark: "dot"},
  {col1: "b", col2: 5, mark: "dot"},
  {col1: "c", col2: 5, mark: "dot"},
]
  const types = {col1: "string", col2: "number", mark: "string"}
duckplot
  .rawData(rawData, types)
  .x("col1")
  .y("col2")
  .color("mark")
  .mark("dot")
  .markColumn("mark")
`;

export const rawDataMultiChart = (options) =>
  renderPlot("stocks.csv", codeString, options);
