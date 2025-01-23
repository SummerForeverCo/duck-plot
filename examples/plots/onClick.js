import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const onClick = (event, value) => {
  const div = document.createElement("div");
  div.style.position = "absolute";
  div.style.top = `${value.scaled.y}px`;
  div.style.left = `${value.scaled.x}px`;
  event.srcElement.parentNode.appendChild(
    div
  ).innerText = `You clicked at ${value.scaled.y}`;
  // .innerText = `You clicked at ${JSON.stringify(value)}`;
};
const codeString = `
duckplot
  .table("stocks")
  .x("Date")
  .y("Close")
  .fy("Symbol")    
  .mark("line")
  .options({ height: 300})
  .config({onClick})
`;

export const onclick = (options) =>
  renderPlot("stocks.csv", codeString, options, onClick);
