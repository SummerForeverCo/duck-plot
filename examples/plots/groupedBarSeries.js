import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `
duckplot
  .query('select * from stocks where year(Date) = 2017 AND month(Date) = 1')
  .table("stocks")
  .fx("Date")
  .x("Symbol")
  .y("Close")
  .color("Symbol")
  .mark("barY")
`;

export const groupedBarSeries = (options) =>
  renderPlot("stocks.csv", codeString, options);
