import * as Plot from "@observablehq/plot";
import type { DuckPlot } from "..";
import { Data } from "../types";
import { Markish } from "@observablehq/plot";
import { isColor } from "./getPlotOptions";
import { defaultColors } from "../helpers";

export function getCirclePackMarks(data: any, instance: DuckPlot): Markish[] {
  const plotOptions = instance.derivePlotOptions();
  const yLabel = instance.config().tipLabels?.y ?? plotOptions.y?.label ?? "";
  const textLabel = instance.text().column ?? "";
  const hasSeries =
    instance.color().column && !isColor(instance.color().column);

  const hideTip = instance.isServer || instance.config()?.tip === false;
  const fill = isColor(instance.color()?.column)
    ? instance.color()?.column
    : defaultColors[0];

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
      data.descendants().filter(
        (d: any) =>
          d.data?.children?.length !== 1 && // has more than one child
          d.parent && // has a parent
          d.parent?.children?.length !== 1 // if it's the only child, don't draw a circle
      ),
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
      ...(hasSeries ? { fill: (d) => d.data.series } : { fill }),
      ...(instance.config().customRender
        ? { render: instance.config().customRender }
        : {}),
    }),
    // Labels
    Plot.text(data.leaves(), {
      x: "x",
      y: "y",
      text: (d) => {
        const v = d.data.text
          ? `${d.data.text}`
          : d.parent.data.name || `${d.value.toLocaleString()}`;
        const width = (v.length - 1) * 8 + 5; // TODO: adjust this based on font size?
        const height = 15;
        return d.r * 2 > width && d.r * 2 > height ? v : "";
      },
      textAnchor: "middle",
      fill: "#fff",
    }),
    ...[
      hideTip
        ? []
        : Plot.tip(
            data.leaves(),
            Plot.pointer({
              x: (d) => d.x,
              y: (d) => d.y,
              r: (d: any) => d.r,

              channels: {
                yValue: {
                  label: yLabel,
                  value: (d) =>
                    `${d.data.y.toLocaleString()} (${d.data.percent}%)`,
                },
                textValue: {
                  label: textLabel,
                  value: (d) => `${d.data.text}`,
                },
              },
              format: {
                fill: hasSeries,
                yValue: true,
                textValue: !!textLabel,
                x: false,
                y: false,
              },
            })
          ),
    ],
  ];
}
