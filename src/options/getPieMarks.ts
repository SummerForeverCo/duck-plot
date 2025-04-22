import * as Plot from "@observablehq/plot";
import type { DuckPlot } from "..";
import { Data } from "../types";
import { Markish } from "@observablehq/plot";
import { isColor } from "./getPlotOptions";
import { defaultColors } from "../helpers";
import { cumsum } from "d3-array";
import type { GeometryCollection, Polygon } from "geojson";

// Derived from this example: https://observablehq.com/@observablehq/pie-to-donut-chart
export function getPieMarks(
  data: Data | undefined,
  instance: DuckPlot
): Markish[] {
  if (!data) return [];
  const plotOptions = instance.derivePlotOptions();
  const yLabel = instance.config().tipLabels?.y ?? plotOptions.y?.label ?? "";
  const hideTip = instance.isServer || instance.config()?.tip === false;
  const hasSeries =
    instance.color().column && !isColor(instance.color().column);
  const fill = isColor(instance.color()?.column)
    ? instance.color()?.column
    : defaultColors[0];

  // TODO: move to other fn
  // Prepare pieChartData
  const cs = cumsum(data, (d) => d.y);
  const r = 360 / cs[cs.length - 1];
  for (let i = 0; i < cs.length; ++i) cs[i] *= r;

  const geometries: Polygon[] = data.map((d, i) => {
    const a = -(cs[i - 1] || 0);
    const b = -cs[i];

    return {
      type: "Polygon",
      ...d,
      coordinates: [
        [
          [0, 90],
          [a, 0],
          [(2 * a + b) / 3, 0],
          [(a + 2 * b) / 3, 0],
          [b, 0],
          [0, 90],
        ],
      ],
    };
  });

  return [
    Plot.geo(
      {
        type: "GeometryCollection",
        geometries,
      },
      {
        fill: "series",
      }
    ),
  ];
}
