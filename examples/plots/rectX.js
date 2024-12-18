import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .query('select * from stocks where year(Date) = 2017')
  .table("stocks")
  .x("Close")
  .y("Date")
  .color("Symbol")
  .mark("rectX");
`;

export const rectX = (options) => renderPlot("stocks.csv", codeString, options);
