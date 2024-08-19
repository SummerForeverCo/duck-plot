import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .table("taxi")
  .columns({ x: "date", y: "count", series: "Borough"})  
  .type("line")
  .color({domain: ["Queens", "Bronx", "Manhattan", "Brooklyn", "EWR", "Staten Island"],
    range: ["#ff7f0e", "gray", "gray", "gray", "gray", "gray"]})
  `;

export const barWideColor = (options) =>
  renderPlot("taxi.csv", codeString, options);
