import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .query('select * from stocks_pivoted order by Date')
  .table("stocks_pivoted")
  .y("Date", {label: "This long label should be truncated in the tooltip"})
  .x(["IBM", "AAPL"])
  .mark("barX")
  // .config({percent: true})
  .options({height: 800, width: 400})
`;

export const percentageBarX = (options) =>
  renderPlot("stocks_pivoted.csv", codeString, options);
