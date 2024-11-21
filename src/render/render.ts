import * as Plot from "@observablehq/plot";
import type { DuckPlot } from "..";
import { getTopLevelPlotOptions } from "../options/getPlotOptions";
import { PlotAutoMargin } from "./plotAutoMargin";
import { legendCategorical } from "../legend/legendCategorical";
import { legendContinuous } from "../legend/legendContinuous";

export async function render(
  instance: DuckPlot,
  newLegend: boolean
): Promise<SVGElement | HTMLElement | null> {
  const marks = await instance.getAllMarkOptions(); // updates this._data and this._filteredData
  const document = instance.isServer
    ? instance.jsdom.window.document
    : undefined;
  instance.setSorts();
  const topLevelPlotOptions = await getTopLevelPlotOptions(instance);
  const plotOptions = {
    ...topLevelPlotOptions,
    marks,
    ...(document ? { document } : {}),
  };

  // Adjust margins UNLESS specified otherwise AND not on the server without a
  // font
  const serverWithoutFont = instance.isServer && !instance.font;
  const autoMargin = serverWithoutFont
    ? false
    : instance.config().autoMargin !== false;

  // Create the Plot
  instance.plotObject = autoMargin
    ? PlotAutoMargin(plotOptions, {}, instance.font)
    : Plot.plot(plotOptions);

  // TODO does this work...?
  instance.plotObject.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  let wrapper: HTMLElement | SVGElement | null = null;

  // Find the parent of the existing chart element
  const parentElement = instance.chartElement?.parentElement;
  // Replace existing content if there's a parent (for interactions)
  if (parentElement) {
    const existingWrapper = parentElement.querySelector(`#${instance.id}`);
    if (existingWrapper) {
      wrapper = existingWrapper as HTMLElement | SVGElement;
      // Clear the wrapper if we're updating the legend
      if (newLegend) {
        wrapper.innerHTML = "";
      } else {
        // Otherwise just remove the plot
        wrapper.removeChild(wrapper.lastChild!);
      }
    }
  } else {
    wrapper = instance.document.createElement("div");
    wrapper.id = instance.id;
  }

  const { hasLegend, legendType } = instance.getLegendSettings();
  if (hasLegend && newLegend) {
    let legend: HTMLDivElement;
    const div = instance.document.createElement("div");

    if (legendType === "categorical") {
      legend = await legendCategorical(instance);
    } else {
      legend = await legendContinuous(instance);
    }
    div.appendChild(legend);
    if (wrapper) wrapper?.appendChild(div);
  }
  if (wrapper) {
    wrapper.appendChild(instance.plotObject);
    instance.chartElement = wrapper as HTMLElement; // track this for re-rendering via interactivity
  }
  return wrapper ?? null;
}