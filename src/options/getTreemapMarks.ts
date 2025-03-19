import * as Plot from "@observablehq/plot";
import type { DuckPlot } from "..";
import { Data } from "../types";
import { Markish } from "@observablehq/plot";
import { isColor } from "./getPlotOptions";
import { defaultColors } from "../helpers";

// getTreemapMarks;
export function getTreemapMarks(data: Data, instance: DuckPlot): Markish[] {
  const plotOptions = instance.derivePlotOptions();
  const yLabel = instance.config().tipLabels?.y ?? plotOptions.y?.label ?? "";
  const hideTip = instance.isServer || instance.config()?.tip === false;
  const hasSeries =
    instance.color().column && !isColor(instance.color().column);
  const fill = isColor(instance.color()?.column)
    ? instance.color()?.column
    : defaultColors[0];

  // TODO: handling text label as input
  const textLabel = instance.text().column ?? "";

  const tip = Plot.tip(
    data,
    Plot.pointer({
      x1: "x0",
      x2: "x1",
      y1: "y0",
      y2: "y1",
      fill: (d) => d.parent.data.name,
      z: (d: any) => {
        return `${d.data.y} (${d.data.percent})`;
      },
      channels: {
        yValue: {
          label: yLabel,
          value: (d) => {
            return `${d.data.y.toLocaleString()} (${d.data.percent}%)`;
          },
        },
        textValue: {
          label: textLabel,
          value: (d) => {
            return `${d.data.text}`;
          },
        },
      },
      format: {
        fill: hasSeries,
        yValue: true,
        textValue: textLabel ? true : false,
        x: false,
        y: false,
      },
    })
  );
  const tipMarks = [tip];
  const otherMark = instance.config().tipMark;
  if (otherMark?.type) {
    const otherTip = Plot[otherMark.type](data, {
      ...Plot.pointer({
        x: (d) => (d.x0 + d.x1) / 2,
        y: (d) => (d.y0 + d.y1) / 2,
      }),
      ...otherMark.options,
    });
    tipMarks.push(otherTip);
  }

  return [
    Plot.rect(data, {
      x1: "x0",
      x2: "x1",
      y1: "y0",
      y2: "y1",
      ...(hasSeries ? { fill: (d) => d.parent.data.name } : { fill }),
      ...(instance.config().customRender
        ? { render: instance.config().customRender }
        : {}),
    }),
    Plot.text(data, {
      x: "x0",
      y: "y1",
      dx: 4,
      dy: 8,
      text: (d) => {
        const v = d.data.text
          ? `${d.data.text}`
          : d.parent.data.name || `${d.value.toLocaleString()}`;

        const width = (v.length - 1) * 8 + 5; // TODO: adjust this based on font size?
        const height = 15;
        return d.x1 - d.x0 > width && d.y1 - d.y0 > height ? v : "";
      },
      textAnchor: "start",
      fill: "#fff",
    }),
    ...[hideTip ? null : tipMarks],
  ];
}
