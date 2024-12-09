import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `
const rawData = Array.from({length: 1000}, (_, i) => (
  {dateCol: new Date(2017, 0, i), valueCol: i}
))
  const types = {dateCol: "date", valueCol: "number"}
duckplot
  .rawData(rawData, types)
  .x("dateCol")
  .y("valueCol")  
  .mark("rectY")  
`;

export const rectY = (options) => renderPlot("stocks.csv", codeString, options);
