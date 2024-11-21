import { MarkOptions } from "@observablehq/plot";
import type { DuckPlot } from "..";
import { filterData } from "../helpers";
import { derivePlotOptions } from "./derivePlotOptions";
import { getPrimaryMarkOptions } from "./getPrimaryMarkOptions";
import * as Plot from "@observablehq/plot";
import { getCommonMarks, getfyMarks } from "./getPlotOptions";
export function getAllMarkOptions(instance: DuckPlot) {
  // Grab the types and labels from the data
  const { types, labels } = instance.data();

  // Filter down to only the visible series (handled by the legend)
  const filteredData = filterData(
    instance.data(),
    instance.visibleSeries,
    instance.seriesDomain
  );

  // Reassign the named properties back to the filtered array
  filteredData.types = types;
  filteredData.labels = labels;
  instance.filteredData = filteredData;

  const plotOptions = derivePlotOptions(instance);
  const currentColumns = instance.filteredData?.types
    ? Object.keys(instance.filteredData?.types)
    : [];
  const primaryMarkOptions = getPrimaryMarkOptions(instance);

  // Add the primary mark if x and y are defined OR if an aggregate has been
  // specified. Not a great rule, but works for showing aggregate marks with
  // only one dimension

  // Tick Chart can only have x or y
  const isValidTickChart =
    (instance.mark().type === "tickX" && currentColumns.includes("x")) ||
    (instance.mark().type === "tickY" && currentColumns.includes("y"));

  const hasX = currentColumns.includes("x");
  const hasY = currentColumns.includes("y");
  const hasAggregate =
    instance.config().aggregate !== undefined &&
    instance.config().aggregate !== false;
  const hasColumnsOrAggregate =
    (hasX && hasY) || ((hasX || hasY) && hasAggregate);

  const showPrimaryMark =
    (isValidTickChart || hasColumnsOrAggregate) && instance.mark().type;

  const primaryMark = showPrimaryMark
    ? [
        Plot[instance.mark().type!](
          instance.filteredData,
          primaryMarkOptions as MarkOptions
        ),
      ]
    : [];

  // TODO: Make frame/grid config options(?)
  const commonPlotMarks = [
    ...getCommonMarks(currentColumns),
    ...(instance.options().marks || []),
  ];

  const fyMarks = getfyMarks(
    instance.filteredData,
    currentColumns,
    plotOptions.fy
  );
  return [
    ...(commonPlotMarks || []),
    ...(primaryMark || []),
    ...(fyMarks || []),
  ];
}
