import * as Plot from "@observablehq/plot";
import type { DuckPlot } from "..";
import { Data } from "../types";
import { Markish } from "@observablehq/plot";
import { extent, scaleLinear } from "d3";

// getCirclePackMarks
// TODO: data type
export function getCirclePackMarks(data: any, instance: DuckPlot): Markish[] {
  const plotOptions = instance.derivePlotOptions();
  const yLabel = instance.config().tipLabels?.y ?? plotOptions.y?.label ?? "";
  const textLabel = instance.text().column ?? "";

  return [
    // Parent circle
    Plot.dot(
      data.descendants().filter((d: any) => !d.parent),
      {
        x: "x",
        y: "y",
        r: "r",
        fill: "none",
        stroke: "#f3f3f3",
      }
    ),
    // Container circles
    Plot.dot(
      data
        .descendants()
        .filter((d: any) => d.data?.children?.length !== 1 && d.parent),
      {
        x: "x",
        y: "y",
        r: "r",
        stroke: (d) => {
          return d.data.name;
        },
      }
    ),
    // Individual circles
    Plot.dot(data.leaves(), {
      x: "x",
      y: "y",
      r: "r",
      fill: (d) => d.data.series,
    }),
    // Labels
    Plot.text(data.leaves(), {
      x: "x",
      y: "y",
      text: (d) => {
        const v = d.data.text ? `${d.data.text}` : d.parent.data.name;
        const width = (v.length - 1) * 8 + 5; // TODO: adjust this based on font size?
        const height = 15;
        return d.r * 2 > width && d.r * 2 > height ? v : "";
      },
      textAnchor: "middle",
      fill: "#fff",
    }),
  ];
}
