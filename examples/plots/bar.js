import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .data({ ddb: db, table: "taxi" })
  .columns({ x: "date", y: "count", series: "Borough"})
  .config({width: 200, height: 200, xLabel: ''})
  .type("line");`;

export const bar = (duckplot) => renderPlot(duckplot, "taxi.csv", codeString);
