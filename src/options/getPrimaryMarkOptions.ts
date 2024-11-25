import { MarkOptions } from "@observablehq/plot";
import { DuckPlot } from "..";
import { isColor } from "./getPlotOptions";
import { defaultColors } from "../helpers";

// Get options for a specific mark (e.g., the line or area marks)
export function getPrimaryMarkOptions(instance: DuckPlot) {
  // Grab the types from the data
  const { types } = instance.data();
  const type = instance.mark().type;
  const data = instance.filteredData ?? instance.data();
  const currentColumns = Object.keys(data.types || {});
  const color = isColor(instance.color()?.column)
    ? instance.color()?.column
    : defaultColors[0];
  const stroke = currentColumns.includes("series") ? "series" : color;

  const fill = currentColumns.includes("series") ? "series" : color;
  const fx = currentColumns.includes("fx") ? "fx" : undefined;

  const sort =
    instance.mark().options?.sort ?? (types?.x !== "string" && type !== "barX")
      ? { sort: (d: any) => d.x }
      : {};

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
    ...(instance.mark().options ? { ...instance.mark().options } : {}),
    ...(currentColumns.includes("series")
      ? {
          [type === "line" ||
          type?.startsWith("rule") ||
          type?.startsWith("tick")
            ? "stroke"
            : "fill"]: `series`,
        }
      : {}),
  } satisfies MarkOptions;
}
