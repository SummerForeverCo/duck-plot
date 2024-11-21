import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `// Standard area chart
duckplot
  .table("stocks")
  .x("Date")
  .y("Open")
  .color("Open")
  .mark("dot")
  .options({
    width: 600,
    color: {
        scheme: "blues"
    }
  })
`;

export const colorSchemeContinuous = (options) =>
  renderPlot("stocks.csv", codeString, options);
