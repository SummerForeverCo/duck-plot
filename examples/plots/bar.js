import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .data({ ddb: db, table: "taxi" })
  .columns({ x: "Borough", y: "count"})
  .type("barY");`;

export const bar = (duckplot) => renderPlot(duckplot, "taxi.csv", codeString);
