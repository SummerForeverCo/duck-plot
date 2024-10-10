// legendContinuous.ts
import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import { PlotOptions } from "@observablehq/plot";
export function legendContinuous(options: PlotOptions): HTMLDivElement {
  // Create a div container
  const container = document.createElement("div");
  container.style.position = "relative"; // Important for positioning elements correctly
  container.style.width = "300px";
  container.style.height = "100px";
  const plotLegend = Plot.legend(options) as HTMLDivElement;
  container.appendChild(plotLegend);
  // Create an SVG element for the brush, inside the same div
  console.log(options);
  console.log(plotLegend.clientWidth);
  console.log(plotLegend.clientHeight);
  const width = options.width || 240;
  const height = options.height || 50;
  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("position", "absolute") // Position it over the legend
    .style("top", "0px")
    .style("left", "0px");

  // Add a D3 brush on top of the legend
  const brush = d3
    .brushX()
    .extent([
      [0, 0],
      [width, height],
    ]) // Adjust extent to match the container dimensions
    .on("brush end", brushed);

  svg.append("g").call(brush);

  // Function to handle brush events
  function brushed(event) {
    if (event.selection) {
      const [x0, x1] = event.selection;
      console.log(`Selected domain: ${x0} - ${x1}`);
      // Add logic to filter or update data based on the selection
    }
  }
  return container;
}
