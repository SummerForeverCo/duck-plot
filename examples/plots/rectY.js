import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .query('select * from stocks where year(Date) = 2017')
  .table("stocks")
  .x("Date")
  .y("Close")
  .color("Symbol")
  .mark("rectY");
`;

export const rectY = (options) => renderPlot("stocks.csv", codeString, options);
