// legendContinuous.ts
import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import { PlotOptions } from "@observablehq/plot";
export function legendContinuous(
  options: PlotOptions,
  onBrush: null | ((domain: any[]) => void),
  initialSelection?: any[] // Pass an initial selection range
): HTMLDivElement {
  const container = document.createElement("div");
  container.style.position = "relative";
  container.style.width = "300px";

  const plotLegend = Plot.legend(options) as HTMLDivElement & Plot.Plot;
  container.appendChild(plotLegend);

  if (onBrush !== null) {
    const width = options.width || 240;
    const height = options.height || 50;
    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("position", "absolute")
      .style("top", "0px")
      .style("left", "0px");

    const brush = d3
      .brushX()
      .extent([
        [0, 0],
        [width, height],
      ])
      .on("brush end", brushed);

    const brushGroup = svg.append("g").call(brush);

    let isProgrammatic = false; // Flag to track programmatic updates

    const scale = d3
      .scaleLinear()
      .domain(options?.color?.domain ?? [])
      .range([0, width]);

    function brushed(event: d3.D3BrushEvent<unknown>) {
      if (isProgrammatic) {
        isProgrammatic = false; // Reset the flag after programmatic change
        return;
      }

      if (event.selection) {
        const [x0, x1] = event.selection as [number, number];
        if (onBrush) onBrush([scale.invert(x0), scale.invert(x1)]);
      } else {
        if (onBrush) onBrush([]);
      }
    }

    if (initialSelection && initialSelection.length === 2) {
      const [x0, x1] = initialSelection.map(scale) as [number, number];

      // Set the flag before programmatically moving the brush
      isProgrammatic = true;
      brushGroup.call(brush.move, [x0, x1]);
    }
  }

  return container;
}
