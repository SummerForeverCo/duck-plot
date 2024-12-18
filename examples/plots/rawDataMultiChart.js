import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `
const rawData = [
  {col1: "a", col2: 5, col3: "Sales", mark: "barY"},
  {col1: "b", col2: 2, col3: "Sales", mark: "barY"},
  {col1: "c", col2: 3, col3: "Sales", mark: "barY"},
  {col1: "a", col2: 10, col3: "Clicks", mark: "line"},
  {col1: "b", col2: 5, col3: "Clicks", mark: "line"},
  {col1: "c", col2: 5, col3: "Clicks", mark: "line"},
  // TODO: would be nice if the mark generated a different color by default
  {col1: "a", col2: 10, col3: "Clicks-dot", mark: "dot"},
  {col1: "b", col2: 5, col3: "Clicks-dot", mark: "dot"},
  {col1: "c", col2: 5, col3: "Clicks-dot", mark: "dot"},
]
  const types = {col1: "string", col2: "number", col3: "string", mark: "string"}
duckplot
  .rawData(rawData, types)
  .x("col1")
  .y("col2")
  .color("col3")
  .markColumn("mark")
`;

export const rawDataMultiChart = (options) =>
  renderPlot("stocks.csv", codeString, options);
