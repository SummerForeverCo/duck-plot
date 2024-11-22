import { MarkOptions } from "@observablehq/plot";
import { DuckPlot } from "..";
import { borderOptions } from "../helpers";
import * as Plot from "@observablehq/plot";

// Get options for a specific mark (e.g., the line or area marks)
export function getTipMark(instance: DuckPlot) {
  const plotOptions = instance.derivePlotOptions();
  const xLabel = instance.config().tipLabels?.x ?? plotOptions.x?.label ?? "",
    yLabel = instance.config().tipLabels?.y ?? plotOptions.y?.label ?? "",
    xValue = instance.config().tipValues?.x,
    yValue = instance.config().tipValues?.y;
  const data = instance.filteredData ?? instance.data();
  const currentColumns = Object.keys(data.types || {});

  const tip = {
    tip: {
      stroke: borderOptions.borderColor,
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
    },
  };
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
    ...tip,
  } satisfies MarkOptions;

  return Plot.tip(instance.data(), Plot.pointerX(options));
}
