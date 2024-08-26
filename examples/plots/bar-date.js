import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .table("income")
  .x("month")
  .y("consensus_income")
  .color("month")
  .type("barY")
  .options({
    color: {
      label: "Date",
      scheme: "blues"
    }
  })
  `;

export const barDate = (options) =>
  renderPlot("income.csv", codeString, options);
