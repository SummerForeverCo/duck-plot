import { arc } from "./arc"; // custom mark
import * as Plot from "@observablehq/plot";
import { pie as d3pie } from "d3-shape";
import { truncateLabel } from "./getTipMarks";
import { Data, DuckPlotInstance } from "../types";
import { Markish } from "@observablehq/plot";

export function getPieMarks(
  data: Data | undefined,
  instance: DuckPlotInstance
): Markish[] {
  if (!data) return [];
  const plotOptions = instance.derivePlotOptions();
  const outerRadius =
    Math.min((plotOptions.width ?? 0) - 20, (plotOptions.height ?? 0) - 20) / 2;

  const donut = instance.config().donut;
  const innerRadius = donut ? outerRadius / 2 : 0;

  const pieGen = d3pie<{ y: number; series: string }>()
    .value((d) => d.y)
    .padAngle(0.005)
    .sort(null);

  const pieData = pieGen(data as { y: number; series: string }[]).map(
    (
      d
    ): {
      startAngle: number;
      endAngle: number;
      series: string;
      y: number;
      x: number;
      yPos: number;
    } => {
      const angle = (d.startAngle + d.endAngle) / 2;
      const domainExtent = donut ? 90 + 45 : 90;
      const labelRadius = domainExtent;
      return {
        startAngle: d.startAngle,
        endAngle: d.endAngle,
        series: d.data?.series,
        y: d.data?.y,
        x: (Math.sin(angle) * labelRadius) / 2,
        yPos: (Math.cos(angle) * labelRadius) / 2,
      };
    }
  );

  const slices = arc(pieData, {
    x: (d: { x: number }) => d.x,
    y: (d: { yPos: number }) => d.yPos,
    startAngle: (d: { startAngle: number }) => d.startAngle,
    endAngle: (d: { endAngle: number }) => d.endAngle,
    innerRadius,
    outerRadius,
    fill: (d: { series: string }) => d.series,
    customRender: instance.config().customRender,
  });

  const total = data.reduce((sum, d) => sum + d.y, 0);

  const hideTip = instance.isServer || instance.config()?.tip === false;
  const yLabel = instance.config().tipLabels?.y ?? plotOptions.y?.label ?? "";
  const tipMark = hideTip
    ? null
    : Plot.tip(
        pieData,
        Plot.pointer({
          fill: "series",
          x: (d) => d.x,
          y: (d) => d.yPos,
          channels: {
            yCustom: {
              label: truncateLabel(yLabel),
              value: "y",
            },
            percent: {
              label: "Percent",
              value: (d) => {
                const percent = (((d.y ?? 0) / total) * 100).toFixed(1);
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
          },
        })
      );

  const labels = instance.config().pieLabels;

  const labelMark = !labels
    ? null
    : Plot.text(pieData, {
        x: (d) => d.x,
        y: (d) => d.yPos,
        text: (d) => labels[d.series],
        textAnchor: "middle",
      });

  // Additional tip marks
  const tipMarks = [tipMark];
  const otherMark = instance.config().tipMark;
  if (otherMark?.type) {
    const otherTip = Plot[otherMark.type](
      pieData,
      Plot.pointer({
        x: (d) => d.x,
        y: (d) => d.yPos,
        ...otherMark.options,
      })
    );
    tipMarks.push(otherTip);
  }

  return [slices, labelMark, ...tipMarks];
}
