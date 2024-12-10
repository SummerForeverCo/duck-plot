import * as Plot from "@observablehq/plot";
import type { DuckPlot } from "..";
import { Data } from "../types";
import { Markish } from "@observablehq/plot";

// getTreemapMarks;
export function getTreemapMarks(data: Data, instance: DuckPlot): Markish[] {
  const plotOptions = instance.derivePlotOptions();
  const yLabel = instance.config().tipLabels?.y ?? plotOptions.y?.label ?? "";
  // TODO: handling text label as input
  const textLabel = instance.text().column ?? "";
  return [
    Plot.rect(data, {
      x1: "x0",
      x2: "x1",
      y1: "y0",
      y2: "y1",
      fill: (d) => d.parent.data.name,
    }),
    Plot.text(data, {
      x: "x0",
      y: "y1",
      dx: 15,
      dy: 8,
      text: (d) => {
        const v = d.data.text ? `${d.data.text}` : d.parent.data.name;
        const width = (v.length - 1) * 8 + 5; // TODO: adjust this based on font size?
        const height = 15;
        return d.x1 - d.x0 > width && d.y1 - d.y0 > height ? v : "";
      },
      fill: "#fff",
    }),
    Plot.tip(
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
              return `${d.data.y} (${d.data.percent}%)`;
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
          color: true,
          yValue: true,
          textValue: textLabel ? true : false,
          x: false,
          y: false,
        },
      })
    ),
  ];
}
