import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `// No mark specified so render should error
duckplot
  .table("stocks")
  .x("Date")
  .y("Close")
  .fy("Symbol")      
  .options({ height: 300})
`;

export const error = (options) => renderPlot("stocks.csv", codeString, options);
