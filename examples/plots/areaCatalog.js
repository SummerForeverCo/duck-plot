import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `// Use a catalog!
duckplot
  .table("stocks")
  .x("Date")
  .y("Open")
  .color("Symbol")
  .mark("areaY")
  .catalog("testcatalog")
`;

export const areaCatalog = (options) =>
  renderPlot("stocks.csv", codeString, options, null, null, "testcatalog");
