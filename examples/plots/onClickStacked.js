import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const onClick = (event, value) => {
  const div = document.createElement("div");
  const svgElement = event.target.closest("svg");
  svgElement.parentNode.appendChild(
    div
  ).innerText = `You clicked on ${JSON.stringify(value)}`;
};
const codeString = `
duckplot
  .table("stocks")
  .x("Date")
  .y("Close")
  .color("Symbol")  
  .mark("barY")
  .options({ height: 300})
  .config({onClick})
`;

export const onClickStacked = (options) =>
  renderPlot("stocks.csv", codeString, options, onClick);
