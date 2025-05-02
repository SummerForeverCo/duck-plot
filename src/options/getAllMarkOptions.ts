import { MarkOptions } from "@observablehq/plot";
import type { DuckPlot } from "..";
import { filterData } from "../helpers";
import { derivePlotOptions } from "./derivePlotOptions";
import { getPrimaryMarkOptions } from "./getPrimaryMarkOptions";
import * as Plot from "@observablehq/plot";
import { getCommonMarks, getfyMarks } from "./getPlotOptions";
import { ChartType, Data } from "../types";
import { getTipMarks } from "./getTipMarks";
import { getTreemapMarks } from "./getTreemapMarks";
import { prepareTreemapData } from "./prepareTreemapData";
import { getCirclePackMarks } from "./getCirclePackMarks";
import { prepareCirclePackData } from "./prepareCirclePackData";
import { getPieMarks } from "./getPieMarks";
import { getGeoMarks } from "./getGeoMarks";
export function getAllMarkOptions(instance: DuckPlot) {
  // Grab the types and labels from the data
  const { types, labels } = instance.data();
  const mark = instance.mark().type;

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

  // Add the primary mark if x and y are defined OR if an aggregate has been
  // specified. Not a great rule, but works for showing aggregate marks with
  // only one dimension

  // Tick Chart can only have x or y
  const isValidTickChart =
    (mark === "tickX" && currentColumns.includes("x")) ||
    (mark === "tickY" && currentColumns.includes("y"));

  const hasX = currentColumns.includes("x");
  const hasY = currentColumns.includes("y");
  const hasAggregate =
    instance.config().aggregate !== undefined &&
    instance.config().aggregate !== false;
  const hasColumnsOrAggregate =
    (hasX && hasY) || ((hasX || hasY) && hasAggregate);
  // TODO: do we need to update showMark logic for multiple marks?

  const isValidTreemap = mark === "treemap" && hasY;
  const isValidCirclePack = mark === "circlePack" && hasY;
  const isValidPie = mark === "pie" && hasY;
  const isValidGeo = mark === "geo" && hasY; // TODO has area

  // Special case where the rawData has a mark column, render a different mark
  // for each subset of the data
  const markColumnMarks: ChartType[] = Array.from(
    new Set(instance.filteredData.map((d) => d.markColumn).filter((d) => d))
  );
  const showPrimaryMark =
    (isValidTickChart ||
      hasColumnsOrAggregate ||
      isValidTreemap ||
      isValidCirclePack ||
      isValidGeo ||
      isValidPie) &&
    (mark || markColumnMarks.length > 0);

  // Assume that if someone has specified a markcolumn, they want to show it
  const marks: ChartType[] =
    markColumnMarks.length > 0 && instance.markColumn().column !== undefined
      ? markColumnMarks
      : [mark!];
  console.log({ marks });

  const primaryMarks = showPrimaryMark
    ? [
        ...marks.map((mark: ChartType) => {
          const markData: Data | undefined = instance.filteredData?.filter(
            (d) => {
              return markColumnMarks.length > 0 ? d.markColumn === mark : true;
            }
          );
          return mark === "treemap"
            ? getTreemapMarks(prepareTreemapData(markData, instance), instance)
            : mark === "circlePack"
            ? getCirclePackMarks(
                prepareCirclePackData(markData, instance),
                instance
              )
            : mark === "pie"
            ? getPieMarks(markData, instance)
            : mark === "geo"
            ? getGeoMarks(markData, instance)
            : Plot[mark!](
                markData,
                getPrimaryMarkOptions(instance, mark) as MarkOptions
              );
        }),
      ].flat()
    : [];

  // TODO: Make frame/grid config options(?)
  const commonPlotMarks = [
    // Only include the common marks if the mark is not a treemap or circlePack
    // or pie
    ...(mark === "treemap" ||
    mark === "circlePack" ||
    mark === "pie" ||
    mark === "geo"
      ? []
      : getCommonMarks(currentColumns)),
    ...(instance.options().marks || []),
  ];

  const fyMarks =
    mark === "treemap" || mark === "circlePack"
      ? []
      : getfyMarks(instance.filteredData, currentColumns, plotOptions.fy);

  const hideTip =
    instance.isServer ||
    instance.config()?.tip === false ||
    !showPrimaryMark ||
    mark === "treemap" ||
    mark === "circlePack";

  const tipMark = hideTip ? [] : getTipMarks(instance);

  return [
    ...(commonPlotMarks || []),
    ...(primaryMarks || []),
    ...(fyMarks || []),
    ...tipMark,
  ];
}
