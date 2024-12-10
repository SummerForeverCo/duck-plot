// TODO: add tests for this coalesing
import type { DuckPlot } from "..";
import { defaultColors } from "../helpers";

const defaultOptions = {
  width: 500,
  height: 281,
  color: defaultColors,
  fx: { label: null },
  className: "plot-chart",
  grid: false,
  style: {
    overflow: "visible",
  },
};
export function derivePlotOptions(instance: DuckPlot) {
  const data = instance.data();
  const options = instance.options();
  let plotOptions = {
    ...defaultOptions,
    ...options,
    x: {
      ...options.x,
      ...instance.x().options,
    },
    y: {
      ...options.y,
      ...instance.y().options,
    },
    color: {
      ...options.color,
      ...instance.color().options,
    },
    fx: {
      ...options.fx,
      ...instance.fx().options,
    },
    fy: {
      ...options.fy,
      ...instance.fy().options,
    },
    r: {
      ...options.r,
      ...instance.r().options,
    },
  };

  // Fallback to computed labels if they are undefined
  if (plotOptions.x.label === undefined) plotOptions.x.label = data.labels?.x;
  if (plotOptions.y.label === undefined) plotOptions.y.label = data.labels?.y;
  if (plotOptions.color.label === undefined)
    plotOptions.color.label = data.labels?.series;

  // Compute an adjusted height based on the legend type
  instance.setLegend(plotOptions);
  // Different legend height for continuous, leave space for categorical label
  // TODO: handle other continuous scale types?
  const legendHeight =
    instance.legendType === "continuous"
      ? 50
      : plotOptions.color?.label
      ? 44
      : 28;
  plotOptions.height = instance.hasLegend
    ? (plotOptions.height || 281) - legendHeight
    : plotOptions.height || 281;
  return plotOptions;
}
