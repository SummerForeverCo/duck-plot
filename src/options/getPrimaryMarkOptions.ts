import { MarkOptions, Plot, RenderFunction } from "@observablehq/plot";
import { DuckPlot } from "..";
import { isColor } from "./getPlotOptions";
import { defaultColors } from "../helpers";
import { ChartType } from "../types";
import { computeInterval } from "./getInterval";
import * as d3 from "d3";

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

  // Click events are assigned to the primary mark so that we can access the
  // transformed (e.g., stacked) data in the click events
  const render: RenderFunction | undefined =
    instance.config().onClick && !instance.isServer
      ? function (index, scales, values, dimensions, context, next) {
          context.ownerSVGElement.addEventListener("pointerdown", (event) => {
            event.stopImmediatePropagation(); // prevent click-to-stick
            const { value } = context.ownerSVGElement as SVGSVGElement & Plot;
            if (value) {
              // Find the index of the clicked element
              const i = this.data.indexOf(value);
              console.log({ i, values, value });
              // Get the svg coordinate values based on the index
              const x = values.x ? values.x[i] : 0;
              const y = values.y2 ? values.y2[i] : values.y ? values.y[i] : 0;
              console.log({ y });
              const xOffset = scales.scales.x?.bandwidth
                ? scales.scales.x.bandwidth / 2
                : 0;
              const yOffset = scales.scales.y?.bandwidth
                ? scales.scales.y.bandwidth / 2
                : 0;
              const fy =
                value.fy && scales.scales.fy
                  ? scales.scales.fy.apply(value.fy) - dimensions.marginTop
                  : 0;
              console.log({ y, fy, yOffset, valueFy: value.fy, dimensions });
              // For measuring distance from the middle of the bar
              const cx = x + xOffset;
              const cy = y + yOffset + fy;
              const [xPoint, yPoint] = d3.pointer(event);
              // TODO: make sure this works with faceted stacked bar charts
              const yMidPoint =
                values.y1 && values.y2 ? (values.y1[i] + values.y2[i]) / 2 : cy;
              if (Math.hypot(cx - xPoint, yMidPoint - yPoint) < 8) {
                instance.config().onClick!(event, { cx, cy });
                // For demonstration
                d3.select(context.ownerSVGElement)
                  .append("circle")
                  .attr("r", 10)
                  .attr("stroke", "red")
                  .attr("fill", "none")
                  .attr("cx", cx)
                  .attr("cy", cy);
              }
            }
          });
          return next(index, scales, values, dimensions, context);
        }
      : undefined;
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
    ...(render ? { render } : {}),
  };
}
