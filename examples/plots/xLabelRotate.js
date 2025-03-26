import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .query(\`select *, concat('The company: ', Symbol) as company from stocks\`)
  .table("stocks")
  .x("company")
  .y("Close")
  .color("company")
  .mark("barY")
  .options({width: 300})
  .config({aggregate: "avg"})`;

export const xLabelRotate = (options) =>
  renderPlot("stocks.csv", codeString, options);
