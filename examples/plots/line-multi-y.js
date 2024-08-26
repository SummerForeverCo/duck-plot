import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `
duckplot
  .table("income")
  .x("month")
  .y(["consensus_income", "execution_income"], {label: "Income"})
  .type("line")
  .options({
    color: {
      range: ["purple", "green"]
    }})
`;

export const lineMultiY = (options) =>
  renderPlot("income.csv", codeString, options);
