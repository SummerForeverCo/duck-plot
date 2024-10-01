import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `
duckplot  
  .table("income")
  .x("month")  
  .y(["execution_income", "consensus_income"], {label: "Total income"})
  .mark("areaY")
  .options({color: { label: "Income Source"}})
`;

export const areaAltOrder = (options) =>
  renderPlot("income.csv", codeString, options);
