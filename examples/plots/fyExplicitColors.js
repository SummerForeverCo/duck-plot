import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `
duckplot
  .query("select * from income where validator in (1, 2, 3)")
  .table("income")
  .x("month")
  .y(["consensus_income"])
  .fy("validator")
  .color("validator", {domain: [1, 2, 3], range: ["red", "green", "blue"], type: "categorical"})
  .options({width: 600, height: 800})
  .mark("line")
`;

export const fyExplicitColors = (options) =>
  renderPlot("income.csv", codeString, options);
