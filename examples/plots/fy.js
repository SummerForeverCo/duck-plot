import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `
duckplot
  .table("stocks")
  .x("Date")
  .y("Close")
  .fy("Symbol")    
  .mark("line")
  .options({ height: 300})
`;

export const fy = (options) => renderPlot("stocks.csv", codeString, options);
