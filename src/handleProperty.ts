import { PlotOptions } from "@observablehq/plot";
import type { DuckPlot } from ".";
import { IncomingColumType, PlotProperty } from "./types";
import equal from "fast-deep-equal";
import { isColor } from "./getPlotOptions";

export function handleProperty<T extends keyof PlotOptions>(
  instance: DuckPlot,
  prop: PlotProperty<T>,
  column?: IncomingColumType,
  options?: PlotOptions[T],
  propertyName?: string
): PlotProperty<T> | DuckPlot {
  // Because we store empty string for falsey values, we need to check them
  const columnValue = column === false || column === null ? "" : column;

  if (column !== undefined && !equal(columnValue, prop.column)) {
    // Special case handling that we don't need data if color is/was a color
    if (
      !(
        propertyName === "color" &&
        isColor(prop.column) &&
        typeof column === "string" &&
        isColor(column)
      )
    ) {
      instance.newDataProps = true; // When changed, we need to requery the data
    }
  }
  if (column === false || column === null) {
    prop.column = "";
    prop.options = undefined;
  } else {
    if (column !== undefined) prop.column = column;
    if (options !== undefined) prop.options = options;
  }
  return column === undefined ? prop : instance;
}
