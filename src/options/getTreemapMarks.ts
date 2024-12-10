import * as Plot from "@observablehq/plot";
import type { DuckPlot } from "..";
import { Data } from "../types";
import { Markish } from "@observablehq/plot";

// getTreemapMarks;
export function getTreemapMarks(data: Data, instance: DuckPlot): Markish[] {
  return [
    Plot.rect(data, {
      x1: "x0",
      x2: "x1",
      y1: "y0",
      y2: "y1",
      fill: (d) => d.parent.data.name,
      title: (d) => `${d.parent.data.name}: ${d.data.name}`,
    }),
    Plot.text(data, {
      x: "x0",
      y: "y1",
      dx: 15,
      dy: 10,
      text: (d) => {
        const v = d.data.text ? `${d.data.text}` : d.parent.data.name;
        const width = (v.length - 1) * 8 + 5; // TODO: adjust this based on font size?
        const height = 15;
        return d.x1 - d.x0 > width && d.y1 - d.y0 > height ? v : "";
      },
      fill: "#fff",
    }),
  ];
}
