import { MarkOptions } from "@observablehq/plot";
import { DuckPlot } from "..";
import { isColor } from "./getPlotOptions";
import { defaultColors } from "../helpers";
import { ChartType } from "../types";
import { computeInterval } from "./getInterval";

// Get options for a specific mark (e.g., the line or area marks)
export function getPrimaryMarkOptions(
  instance: DuckPlot,
  markType?: ChartType
) {
  if (!markType) return {};
  // Grab the types from the data
  const { types } = instance.data();
  const data = instance.filteredData ?? instance.data();
  const currentColumns = Object.keys(data.types || {});
  // Options may be specified on the mark or the markColumn
  const userOptions =
    instance.mark().options ?? instance.markColumn().options?.[markType];

  const color = isColor(instance.color()?.column)
    ? instance.color()?.column
    : defaultColors[0];
  const stroke = currentColumns.includes("series") ? "series" : color;

  const fill = currentColumns.includes("series") ? "series" : color;
  const fx = currentColumns.includes("fx") ? "fx" : undefined;

  const sort =
    userOptions?.sort ??
    (types?.x !== "string" && markType !== "barX" && markType !== "rectX")
      ? { sort: (d: any) => d.x }
      : {};

  // If this is a rect mark with a date value axis, compute the interval
  let interval;
  if (
    ((markType === "rectY" && types?.x === "date") ||
      (markType === "rectX" && types?.y === "date")) &&
    userOptions?.interval === undefined // Note, there's no way to just say "no default"
  ) {
    interval = computeInterval(data, markType === "rectY" ? "x" : "y");
  }

  return {
    ...(markType === "line" ? { stroke } : { fill }),
    ...(currentColumns.includes("x") ? { x: `x` } : {}),
    ...(sort ? sort : {}),
    ...(currentColumns.includes("fy") ? { fy: "fy" } : {}),
    ...(markType === "dot" && currentColumns.includes("r") ? { r: "r" } : {}),
    ...(markType === "text" && currentColumns.includes("text")
      ? { text: "text" }
      : {}),
    ...(fx ? { fx: `fx` } : {}),
    ...(currentColumns.includes("y") ? { y: `y` } : {}),
    ...(userOptions ? { ...userOptions } : {}),
    ...(interval ? { interval } : {}),
    ...(currentColumns.includes("series")
      ? {
          [markType === "line" ||
          markType?.startsWith("rule") ||
          markType?.startsWith("tick")
            ? "stroke"
            : "fill"]: `series`,
        }
      : {}),
    ...(instance.config().customRender
      ? { render: instance.config().customRender }
      : {}),
  } satisfies MarkOptions;
}
