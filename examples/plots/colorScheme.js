import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `// Standard area chart
duckplot
  .table("stocks")
  .x("Date")
  .y("Open")
  .color("Symbol")
  .mark("areaY")
  .options({
    color: {
        scheme: "category10"
    }
  })
`;

export const colorScheme = (options) =>
  renderPlot("stocks.csv", codeString, options);
