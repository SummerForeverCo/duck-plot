import * as Plot from "@observablehq/plot";
import type { DuckPlot } from "..";
import { Data } from "../types";
import { Markish } from "@observablehq/plot";

// getTreemapMarks;
export function getTreemapMarks(data: Data, instance: DuckPlot): Markish[] {
  const plotOptions = instance.derivePlotOptions();
  const yLabel = instance.config().tipLabels?.y ?? plotOptions.y?.label ?? "";
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
          z: {
            label: yLabel,
            value: (d) => {
              console.log(d.data.y);
              return `${d.data.y} (${d.data.percent}%)`;
            },
          },
        },
        format: {
          color: true,
          z: true,
          x: false,
          y: false,
        },
      })
    ),
  ];
}
