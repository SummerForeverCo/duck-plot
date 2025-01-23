import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const onClick = (event, value) => {
  event.srcElement.parentNode.appendChild(
    document.createElement("div")
  ).innerText = `You clicked at ${JSON.stringify(value)}`;
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
