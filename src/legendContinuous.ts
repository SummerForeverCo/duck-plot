// legendContinuous.ts
import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import { PlotOptions } from "@observablehq/plot";
import type { DuckPlot } from ".";
export async function legendContinuous(
  instance: DuckPlot
): Promise<HTMLDivElement> {
  const color = instance.plotObject?.scale("color");
  const document = instance.document;
  const onBrush =
    instance.config().interactiveLegend === false
      ? null
      : (event: number[]) => {
          instance.seriesDomain = event;
          instance.render(false);
        };

  // Create a div container
  const container = document.createElement("div");
  container.style.position = "relative"; // Important for positioning elements correctly
  container.style.width = "300px";
  const plotLegend = Plot.legend({ color }) as HTMLDivElement & Plot.Plot;
  container.appendChild(plotLegend);
  // Create an SVG element for the brush, inside the same div
  if (onBrush !== null) {
    const width = 240;
    const height = 50;
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
    function brushed(event: d3.D3BrushEvent<unknown>) {
      if (event.selection) {
        // Gotta make a d3 linear scale
        const scale = d3
          .scaleLinear()
          .domain(color?.domain ?? [])
          .range([0, width]).invert;
        // const colorScale = plotLegend.scale.color;
        const [x0, x1] = event.selection as number[];
        if (onBrush) onBrush([scale(x0), scale(x1)]);
      } else {
        if (onBrush) onBrush([]);
      }
    }
  }
  return container;
}
