import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `
const rawData = Array.from({length: 100}, (_, i) => (
  {dateCol: new Date(2017, 0, i), valueCol: i}
))
  const types = {dateCol: "date", valueCol: "number"}
duckplot
  .rawData(rawData, types)
  .x("valueCol")  
  .y("dateCol")
  .mark("rectX")  
`;

export const rectX = (options) => renderPlot("stocks.csv", codeString, options);
