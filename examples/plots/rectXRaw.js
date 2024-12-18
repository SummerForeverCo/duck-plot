import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `
const rawData = Array.from({length: 100}, (_, i) => (
  {dateCol: new Date(2017, 0, i), valueCol: i, mark: "rectY"}
))
  const types = {dateCol: "date", valueCol: "number", mark: "string"}
duckplot
  .rawData(rawData, types)
  .x("dateCol")
  .y("valueCol")
  .markColumn("mark")
`;
export const rectXRaw = (options) =>
  renderPlot("stocks.csv", codeString, options);
