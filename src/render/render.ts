import * as Plot from "@observablehq/plot";
import type { DuckPlot } from "..";
import { getPlotOptions } from "../options/getPlotOptions";
import { PlotAutoMargin } from "./plotAutoMargin";
import { legendCategorical } from "../legend/legendCategorical";
import { legendContinuous } from "../legend/legendContinuous";

export async function render(
  instance: DuckPlot,
  newLegend: boolean
): Promise<SVGElement | HTMLElement | null> {
  // Set this._sorts that is consumed by getAllMarkOptions
  instance.setSorts();

  // Generate Plot Options
  const plotOptions = {
    ...getPlotOptions(instance),
    marks: instance.getAllMarkOptions(),
    ...(instance.document ? { document: instance.document } : {}),
  };

  // Detect if the plot should auto adjust margins
  const autoMargin =
    instance.isServer && !instance.font
      ? false
      : instance.config().autoMargin !== false;

  // Create the Plot
  instance.plotObject = autoMargin
    ? PlotAutoMargin(plotOptions, {}, instance.font)
    : Plot.plot(plotOptions);

  instance.plotObject.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  instance.plotObject.classList.add("plot-object");

  // Ensure the chart container exists
  const container =
    instance.chartContainer || instance.document.createElement("div");
  if (!instance.chartContainer) {
    container.id = instance.id;
    instance.chartContainer = container;
  }

  // Clear existing content if necessary
  if (newLegend) container.innerHTML = "";

  // Add or update the legend
  if (instance.hasLegend && newLegend) {
    const legendContainer =
      container.querySelector(".legend-container") ||
      container.appendChild(instance.document.createElement("div"));

    legendContainer.className = "legend-container";
    legendContainer.innerHTML = ""; // Clear old content
    const legend =
      instance.legendType === "categorical"
        ? await legendCategorical(instance)
        : await legendContinuous(instance);
    legendContainer.appendChild(legend);
  }

  // Replace or append the plot
  const existingPlot = container.querySelector(".plot-object");
  if (existingPlot) {
    container.replaceChild(instance.plotObject, existingPlot);
  } else {
    container.appendChild(instance.plotObject);
  }

  return container;
}
