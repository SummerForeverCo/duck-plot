import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `// Standard area chart
duckplot
  .table("stocks")
  .x("Date")
  .y("Open")
  .color("Symbol")
  .mark("areaY")
  .catalog("testCatalog")
`;

export const area = (options) =>
  renderPlot("stocks.csv", codeString, options, null, null, "testCatalog");
