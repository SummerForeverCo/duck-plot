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

  // Keep track of the hovered element for click events!
  if (instance.config().onClick && !instance.isServer) {
    // function svgToPixel(svgElement: SVGSVGElement, x: number, y: number) {
    //   const viewBox = svgElement.viewBox.baseVal;
    //   const renderedWidth = svgElement.clientWidth;
    //   const renderedHeight = svgElement.clientHeight;

    //   const scaleX = renderedWidth / viewBox.width;
    //   const scaleY = renderedHeight / viewBox.height;

    //   const pixelX = (x - viewBox.x) * scaleX;
    //   const pixelY = (y - viewBox.y) * scaleY;

    //   return { x: pixelX, y: pixelY };
    // }
    instance.plotObject.addEventListener(
      "pointerdown",
      (event) => {
        event.stopPropagation();
        const raw = instance.plotObject?.value;
        // Scale the point to the svg's coordinates
        // const scaled = {
        //   x:
        //     instance.plotObject?.scale("x")?.apply(raw.x) +
        //     (instance.plotObject?.scale("fx")?.apply(raw.fx) || 0),
        //   y:
        //     instance.plotObject?.scale("y")?.apply(raw.y) +
        //     (instance.plotObject?.scale("fy")?.apply(raw.fy) || 0) -
        //     10, // for font height,
        // };

        // // Convert the scaled point to pixel coordinates
        // const scaled = svgToPixel(
        //   instance.plotObject as SVGSVGElement,
        //   scaledRaw.x,
        //   scaledRaw.y
        // );

        instance.config().onClick!(event, { ...raw });
        // Force a pointerleave to hide the tooltip
        // see https://github.com/observablehq/plot/issues/1832
        const pointerleave = new PointerEvent("pointerleave", {
          bubbles: true,
          pointerType: "mouse",
        });
        event.target?.dispatchEvent(pointerleave);
      },
      { capture: true }
    );
  }

  instance.plotObject.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  instance.plotObject.classList.add("plot-object");

  // Set a minimum width and height for rects for visibility
  const allMarks = instance.mark()?.type
    ? [instance.mark().type]
    : Array.from(
        new Set(
          instance.filteredData?.map((d) => d.markColumn).filter((d) => d) || []
        )
      );

  if (allMarks.some((mark) => ["rectY", "rectX"].includes(mark))) {
    const minSize = 0.5;
    const rects = instance.plotObject.querySelectorAll("rect");
    rects.forEach((rect) => {
      if (allMarks.includes("rectY")) {
        const width = rect.getAttribute("width");
        if (width && +width < minSize) {
          rect.setAttribute("width", `${minSize}`);
        }
      }
      if (allMarks.includes("rectX")) {
        const height = rect.getAttribute("height");
        if (height && +height < minSize) {
          rect.setAttribute("height", `${minSize}`);
        }
      }
    });
  }

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
