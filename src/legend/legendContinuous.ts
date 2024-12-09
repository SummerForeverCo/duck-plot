// legendContinuous.ts
import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import type { DuckPlot } from "..";
export async function legendContinuous(
  instance: DuckPlot
): Promise<HTMLDivElement> {
  const color = instance.plotObject?.scale("color");
  const document = instance.document;
  const onBrush =
    instance.config().interactiveLegend === false || instance.isServer
      ? null
      : (event: number[]) => {
          instance.seriesDomain = event;
          instance.render(false);
        };

  // Create a div container
  const container = document.createElement("div");
  container.style.position = "relative";
  container.style.width = "300px";
  const plotLegend = Plot.legend({
    color,
    ...(instance.isServer ? { document: instance.document } : {}),
  }) as HTMLDivElement & Plot.Plot;
  container.appendChild(plotLegend);

  if (onBrush !== null) {
    const width = 240;
    const height = 50;
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
      .domain(color?.domain ?? [])
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

    if (instance.seriesDomain && instance.seriesDomain.length === 2) {
      const [x0, x1] = instance.seriesDomain.map(scale) as [number, number];

      // Set the flag before programmatically moving the brush
      isProgrammatic = true;
      brushGroup.call(brush.move, [x0, x1]);
    }
  }

  return container;
}
