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
  // Grab the types from the data
  const { types } = instance.data();
  const type = markType ?? instance.mark().type; // pass in a markType for mulitple marks
  const data = instance.filteredData ?? instance.data();
  const currentColumns = Object.keys(data.types || {});
  const userOptions = instance.mark().options;
  const color = isColor(instance.color()?.column)
    ? instance.color()?.column
    : defaultColors[0];
  const stroke = currentColumns.includes("series") ? "series" : color;

  const fill = currentColumns.includes("series") ? "series" : color;
  const fx = currentColumns.includes("fx") ? "fx" : undefined;

  const sort =
    userOptions?.sort ??
    (types?.x !== "string" && type !== "barX" && type !== "rectX")
      ? { sort: (d: any) => d.x }
      : {};

  // If this is a rect mark with a date value axis, compute the interval
  let interval;
  if (
    ((type === "rectY" && types?.x === "date") ||
      (type === "rectX" && types?.y === "date")) &&
    userOptions?.interval === undefined // Note, there's no way to just say "no default"
  ) {
    interval = computeInterval(data, type === "rectY" ? "x" : "y");
  }

  return {
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
    ...(userOptions ? { ...userOptions } : {}),
    ...(interval ? { interval } : {}),
    ...(currentColumns.includes("series")
      ? {
          [type === "line" ||
          type?.startsWith("rule") ||
          type?.startsWith("tick")
            ? "stroke"
            : "fill"]: `series`,
        }
      : {}),
    ...(instance.config().customRender
      ? { render: instance.config().customRender }
      : {}),
  } satisfies MarkOptions;
}
