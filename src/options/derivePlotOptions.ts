// TODO: add tests for this coalesing
import type { DuckPlot } from "..";

export async function derivePlotOptions(instance: DuckPlot) {
  const chartData = await instance.prepareChartData();
  const options = instance.options();
  let plotOptions = {
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
    // TODO: figure out how we want to handle fx and fy (and their options).
    // Probably not allow them to be passed in.
    fy: {
      ...options.fy,
      ...instance.fy().options,
    },
    // TODO(?): add text and r options here to enable either way to be passed in
  };

  // Fallback to computed labels if they are undefined
  if (plotOptions.x.label === undefined)
    plotOptions.x.label = chartData.labels?.x;
  if (plotOptions.y.label === undefined)
    plotOptions.y.label = chartData.labels?.y;
  if (plotOptions.color.label === undefined)
    plotOptions.color.label = chartData.labels?.series;

  // Compute an adjusted height based on the legend type
  instance.setLegend(plotOptions);
  const { legendType, hasLegend } = instance.getLegendSettings();
  // Different legend height for continuous, leave space for categorical label
  // TODO: handle other continuous scale types?
  const legendHeight =
    legendType === "continuous" ? 50 : plotOptions.color?.label ? 44 : 28;
  plotOptions.height = hasLegend
    ? (plotOptions.height || 281) - legendHeight
    : plotOptions.height || 281;
  return plotOptions;
}
