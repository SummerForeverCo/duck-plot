import { MarkOptions } from "@observablehq/plot";
import { DuckPlot } from ".";
import { isColor } from "./getPlotOptions";
import { borderOptions, defaultColors } from "./helpers";

// Get options for a specific mark (e.g., the line or area marks)
export async function getMarkOptions(instance: DuckPlot) {
  const allData = await instance.prepareChartData(); // TODO: maybe can just call data()?
  const plotOptions = await instance.derivePlotOptions(); // TODO: maybe there's a way to just grab these
  const xLabel = instance.config().tipLabels?.x ?? plotOptions.x?.label ?? "",
    yLabel = instance.config().tipLabels?.y ?? plotOptions.y?.label ?? "",
    xValue = instance.config().tipValues?.x,
    yValue = instance.config().tipValues?.y;
  // Grab the types from the data
  const { types } = allData;
  const options = instance.options();
  const type = instance.mark().markType;
  const currentColumns = Object.keys(instance.filteredData().types || {});
  const color = isColor(instance.color()?.column)
    ? instance.color()?.column
    : defaultColors[0];
  const stroke = currentColumns.includes("series") ? "series" : color;

  const fill = currentColumns.includes("series") ? "series" : color;
  const fx = currentColumns.includes("fx") ? "fx" : undefined;
  const tip =
    !instance.isServer && instance.config()?.tip !== false
      ? {
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
        }
      : {};
  const ellipsis = "…";
  function truncateLabel(label: string | undefined, length: number = 25) {
    if (!label || label.length < length) return label;
    return label.slice(0, length) + ellipsis;
  }

  const sort =
    instance.mark().options?.sort ?? (types?.x !== "string" && type !== "barX")
      ? { sort: (d: any) => d.x }
      : {};

  return {
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
    ...(type === "line" ? { stroke } : { fill }),
    ...(currentColumns.includes("x") ? { x: `x` } : {}),
    ...(sort ? sort : {}),
    ...(currentColumns.includes("fy") ? { fy: "fy" } : {}),
    ...(type === "dot" && currentColumns.includes("r") ? { r: "r" } : {}),
    ...(type === "text" && currentColumns.includes("text")
      ? { text: "text" }
      : {}),
    ...(fx ? { fx: `fx` } : {}),
    ...(currentColumns.includes("y") ? { y: `y` } : {}),
    ...(instance.mark().options ? { ...instance.mark().options } : {}),
    ...(currentColumns.includes("series")
      ? {
          [type === "line" || type.startsWith("rule") || type.startsWith("tick")
            ? "stroke"
            : "fill"]: `series`,
        }
      : {}),
  } satisfies MarkOptions;
}
