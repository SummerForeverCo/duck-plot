import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `// Mimicking a dual axis plot to assess margins
const scale = d3.scaleLinear().domain([0, 100000]).range([0, 400])
duckplot
  .table("stocks")
  .query("SELECT * FROM stocks LIMIT 1000")
  .x("Date")
  .y("Close")
  .mark("line")
  .color("red")
  .options({
    y: {
        axis: 'left',
    },
    height: 300,
    marks: [
        Plot.axisY(scale.ticks(),
        {y:scale, anchor: "right", tickSize: 0,
        tickPadding: 5, label: "Right axis label"})
    ]
  })
`;

export const axisRight = (options) =>
  renderPlot("stocks.csv", codeString, options);
