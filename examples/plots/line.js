import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `
duckplot
  .table("income")
  .query("SELECT * FROM income LIMIT 100")
  .x("month", {label: "Date", axis: "top", grid: true})
  .y("consensus_income", {type: "log"})
  .type("line")
  .color("red")
  .options({width: 400, height: 500, y: {domain: [100, 30000]}})
`;

export const line = (options) => renderPlot("income.csv", codeString, options);
