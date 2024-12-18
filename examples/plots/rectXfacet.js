import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .query('select * from stocks where year(Date) = 2017')
  .table("stocks")
  .x("Close")
  .y("Date")
  .color("Symbol")
  .fy("Symbol")
  .mark("rectX")
  .options({height: 800})
  ;
`;

export const rectXfacet = (options) =>
  renderPlot("stocks.csv", codeString, options);
