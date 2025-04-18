import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `
duckplot
  .query(\`select * from stocks where year(Date) = 2017 AND month(Date) = 1 AND Symbol = 'AAPL'\`)
  .table("stocks")
  .fx("Date")
  .y(["Low", "High"])  
  .mark("barY")
`;

export const groupedBarMultiYReorder = (options) =>
  renderPlot("stocks.csv", codeString, options);
