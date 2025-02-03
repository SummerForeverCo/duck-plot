import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const onClick = (event, value) => {
  console.log({ event, value });
  const div = document.createElement("div");
  event.srcElement.parentNode.appendChild(
    div
  ).innerText = `You clicked on ${JSON.stringify(value)}`;
};
const codeString = `
duckplot
  .table("stocks")
  .x("Date")
  .y("Close")
  .color("Symbol")
  .fy("Symbol")    
  .mark("line")
  .options({ height: 300})
  .config({onClick})
`;

export const onclick = (options) =>
  renderPlot("stocks.csv", codeString, options, onClick);
