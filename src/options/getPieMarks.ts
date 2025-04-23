import * as Plot from "@observablehq/plot";
import type { DuckPlot } from "..";
import { Data } from "../types";
import { Markish } from "@observablehq/plot";
import { isColor } from "./getPlotOptions";
import { defaultColors } from "../helpers";
import { cumsum } from "d3-array";
import type { GeometryCollection, Polygon } from "geojson";

type PolygonWithSeries = Polygon & { series?: string };
// Derived from this example: https://observablehq.com/@observablehq/pie-to-donut-chart
export function getPieMarks(
  data: Data | undefined,
  instance: DuckPlot
): Markish[] {
  if (!data) return [];
  const plotOptions = instance.derivePlotOptions();
  const hideTip = instance.isServer || instance.config()?.tip === false;
  // TODO: move to other fn
  // Prepare pieChartData
  const cs = cumsum(data, (d) => d.y);
  const r = 360 / cs[cs.length - 1];
  for (let i = 0; i < cs.length; ++i) cs[i] *= r;

  const geometries: PolygonWithSeries[] = data.map((d, i) => {
    const a = -(cs[i - 1] || 0);
    const b = -cs[i];
    const numSteps = 3; // Keep an eye on this, it may need to be adjusted

    const arcPoints = Array.from({ length: numSteps + 1 }, (_, j) => [
      a + ((b - a) * j) / numSteps,
      0,
    ]);

    return {
      type: "Polygon",
      ...d,
      coordinates: [[[0, 90], ...arcPoints, [0, 90]]],
    };
  });
  const tip = Plot.tip(
    geometries,
    Plot.pointer(
      Plot.geoCentroid({
        fill: "series",
      })
    )
  );
  const tipMarks = [tip];
  const otherMark = instance.config().tipMark;
  if (otherMark?.type) {
    const otherTip = Plot[otherMark.type](geometries, {
      ...Plot.pointer(
        Plot.geoCentroid({
          x: (d) => (d.x0 + d.x1) / 2,
          y: (d) => (d.y0 + d.y1) / 2,
        })
      ),
      ...otherMark.options,
    });
    tipMarks.push(otherTip);
  }

  const labels = instance.config().pieLabels;
  const labelData = geometries.filter(
    (d) => d.series && labels[d.series] !== undefined
  );

  const labelMark = Plot.text(
    labelData,
    Plot.geoCentroid({
      x: (d) => d.x0,
      y: (d) => d.y0,
      text: (d) => labels[d.series],
      fontSize: 12,
      textAnchor: "middle",
      dy: -5,
    })
  );
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
    ...[hideTip ? null : tipMarks],
    ...[!labelData ? null : labelMark],
  ];
}
