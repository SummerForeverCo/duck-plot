import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `
duckplot
  .query(\`SELECT Date, Symbol, measure, value
    FROM stocks
    UNPIVOT (value FOR measure IN (Open, High, Low, Close))
    WHERE year(Date) = 2017
    ORDER BY Date, measure, Symbol
  \`)
  .table("stocks")
  .x("Date")
  .y("value")
  .color("Symbol")
  .fy("measure")
  .options({width: 1600, height: 600})
  .mark("barY")
  .config({percent: true})
`;

export const percentageFacet = (options) =>
  renderPlot("stocks.csv", codeString, options);
