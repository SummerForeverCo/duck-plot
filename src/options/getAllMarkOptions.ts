import { MarkOptions } from "@observablehq/plot";
import type { DuckPlot } from "..";
import { filterData } from "../helpers";
import { derivePlotOptions } from "./derivePlotOptions";
import { getPrimaryMarkOptions } from "./getPrimaryMarkOptions";
import * as Plot from "@observablehq/plot";
import { getCommonMarks, getfyMarks } from "./getPlotOptions";
export async function getAllMarkOptions(instance: DuckPlot) {
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

  const plotOptions = await derivePlotOptions(instance);
  const currentColumns = instance.filteredData?.types
    ? Object.keys(instance.filteredData?.types)
    : [];
  const primaryMarkOptions = await getPrimaryMarkOptions(instance);

  // Here, we want to add the primary mark if x and y are defined OR if an
  // aggregate has been specifid. Not a great rule, but works for now for
  // showing aggregate marks with only one dimension
  const isValidTickChart =
    (instance.mark().type === "tickX" && currentColumns.includes("x")) ||
    (instance.mark().type === "tickY" && currentColumns.includes("y"));

  const primaryMark =
    !isValidTickChart &&
    (!currentColumns.includes("x") || !currentColumns.includes("y")) &&
    !instance.config().aggregate
      ? []
      : instance.mark().type
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
