import * as Plot from "@observablehq/plot";
import type { DuckPlot } from "..";
import { Data } from "../types";
import { Markish } from "@observablehq/plot";
import { isColor } from "./getPlotOptions";
import { defaultColors } from "../helpers";
import { cumsum } from "d3-array";
import type { GeometryCollection, Polygon } from "geojson";
import { truncateLabel } from "./getTipMarks";
type PolygonWithSeries = Polygon & { series?: string };

// Derived from this example: https://observablehq.com/@observablehq/pie-to-donut-chart
export function getPieMarks(
  data: Data | undefined,
  instance: DuckPlot
): Markish[] {
  if (!data) return [];
  const plotOptions = instance.derivePlotOptions();
  const { geometries, total } = preparePieData(data);

  // Get tip label from config (if there)
  const hideTip = instance.isServer || instance.config()?.tip === false;
  const yLabel = instance.config().tipLabels?.y ?? plotOptions.y?.label ?? "";
  const tip = Plot.tip(
    geometries,
    Plot.pointer(
      Plot.geoCentroid({
        fill: "series",
        channels: {
          yCustom: {
            label: truncateLabel(yLabel),
            value: "y",
          },
          percent: {
            label: "Percent",
            value: (d) => {
              const percent = ((d.y / total) * 100).toFixed(1);
              return `${percent}%`;
            },
          },
        },
        format: {
          yCustom: true,
          percent: true,
          color: true,
          x: false,
          y: false,
          fy: false,
          fx: false,
          z: false, // Hide the auto generated "series" for area charts
        },
      })
    )
  );

  // Additional tip marks
  const tipMarks = [tip];
  const otherMark = instance.config().tipMark;
  if (otherMark?.type) {
    const otherTip = Plot[otherMark.type](geometries, {
      ...Plot.pointer(Plot.geoCentroid()),
      ...otherMark.options,
    });
    tipMarks.push(otherTip);
  }

  // Labels
  const labels = instance.config().pieLabels;
  const labelData = labels
    ? geometries.filter((d) => d.series && labels[d.series] !== undefined)
    : null;

  const labelMark =
    labels && labelData
      ? Plot.text(
          labelData,
          Plot.geoCentroid({
            text: (d) => labels[d.series],
            fontSize: 12,
            textAnchor: "middle",
            dy: -5,
          })
        )
      : null;
  return [
    Plot.geo(
      {
        type: "GeometryCollection",
        geometries,
      },
      {
        fill: "series",
        ...(instance.config().customRender
          ? { render: instance.config().customRender }
          : {}),
      }
    ),
    labelMark,
    ...[hideTip ? null : tipMarks],
  ];
}

function preparePieData(data: Data) {
  // Prepare pieChartData
  const cs = cumsum(data, (d) => d.y);
  const total = cs[cs.length - 1];
  const r = 360 / total;
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
  return { geometries, total };
}
