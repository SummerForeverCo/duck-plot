import { renderPlot } from "../util/renderPlotClient.js";
import * as d3 from "d3";
// This code is both displayed in the browser and executed
const onClick = (event, value) => {};
const render = function (index, scales, values, dimensions, context, next) {
  const g = next(index, scales, values, dimensions, context);
  d3.select(g)
    .selectAll("rect")
    .attr("width", 0)
    .attr("height", 0)
    .transition()
    .delay((d, i) => i * 100)
    .duration(500)
    .attr("width", (d, i) => values.x2[i] - values.x1[i])
    .attr("height", (d, i) => values.y1[i] - values.y2[i]);

  return g;
};
const codeString = `
duckplot
  .query("select round(sum(Close) * RANDOM(), 1) as Close, week(Date) as week from stocks group by week")
    .table("stocks")
    .y("Close")
    .color("week")
    .mark("treemap")
    .text("week")
  .config({onClick, customRender})
`;

export const customrender = (options) =>
  renderPlot("stocks.csv", codeString, options, onClick, render);
