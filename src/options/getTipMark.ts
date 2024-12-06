import { TipOptions } from "@observablehq/plot";
import { DuckPlot } from "..";
import { borderOptions } from "../helpers";
import * as Plot from "@observablehq/plot";

// Get options for a specific mark (e.g., the line or area marks)
export function getTipMark(instance: DuckPlot) {
  const plotOptions = instance.derivePlotOptions();
  const type = instance.mark().type;
  const xLabel = instance.config().tipLabels?.x ?? plotOptions.x?.label ?? "",
    yLabel = instance.config().tipLabels?.y ?? plotOptions.y?.label ?? "",
    xValue = instance.config().tipValues?.x,
    yValue = instance.config().tipValues?.y;
  const data = instance.filteredData ?? instance.data();
  const currentColumns = Object.keys(data.types || {});
  const fx = currentColumns.includes("fx") ? "fx" : undefined;

  const ellipsis = "…";
  function truncateLabel(label: string | undefined, length: number = 25) {
    if (!label || label.length < length) return label;
    return label.slice(0, length) + ellipsis;
  }

  const options = {
    // Create custom labels for x and y (important if the labels are custom but hidden!)
    channels: {
      xCustom: {
        label: truncateLabel(xLabel),
        // TODO: good for grouped bar charts, not good for other fx
        value:
          typeof xValue === "function"
            ? xValue
            : currentColumns.includes("fx")
            ? "fx"
            : "x",
      },
      yCustom: {
        label: truncateLabel(yLabel),
        value: typeof yValue === "function" ? yValue : "y",
      },
    },
    format: {
      xCustom: true,
      yCustom: true,
      x: false,
      y: false,
      color: true,
      fy: false,
      fx: false,
      z: false, // Hide the auto generated "series" for area charts
    },
    stroke: borderOptions.borderColor,
    ...(currentColumns.includes("x") ? { x: `x` } : {}),
    ...(currentColumns.includes("fy") ? { fy: "fy" } : {}),
    ...(fx ? { fx: `fx` } : {}),
    ...(currentColumns.includes("y") ? { y: `y` } : {}),
    ...(currentColumns.includes("series")
      ? {
          [type === "line" ||
          type?.startsWith("rule") ||
          type?.startsWith("tick")
            ? "stroke"
            : "fill"]: `series`,
        }
      : {}),
  } satisfies TipOptions;
  // Explicitly stack the values for area and bar charts
  const maybeStackedOptions =
    type === "areaY" || type === "barY" || type === "rectY"
      ? Plot.stackY(options)
      : type === "barX" || type === "rectX"
      ? Plot.stackX(options)
      : options;

  // User pointerY for barX charts
  const pointer = type === "barX" ? Plot.pointerY : Plot.pointerX;
  return Plot.tip(instance.filteredData, pointer(maybeStackedOptions));
}
