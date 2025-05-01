import { arc as shapeArc } from "d3-shape";
import { create } from "d3-selection";
import { Mark } from "@observablehq/plot";
import type { RenderFunction } from "@observablehq/plot";
import { PieData } from "../types";

type ArcOptions = Partial<{
  startAngle: (d: { startAngle: number }) => number;
  endAngle: (d: { endAngle: number }) => number;
  innerRadius: number;
  outerRadius: number;
  x: number;
  y: number;
  fill: (d: PieData) => string;
  stroke: (d: PieData) => string;
}>;

export class Arc extends Mark {
  data: PieData[];
  channels: any;
  options: ArcOptions;
  fill: (d: any) => string;
  stroke: (d: any) => string;
  constructor(data: PieData[], options: ArcOptions = {}) {
    super();
    const {
      startAngle,
      endAngle,
      innerRadius,
      outerRadius,
      x,
      y,
      fill,
      stroke,
      ...rest
    } = options;

    this.data = data;
    this.channels = {
      startAngle: { value: startAngle },
      endAngle: { value: endAngle },
      innerRadius: { value: innerRadius },
      outerRadius: { value: outerRadius },
      x: { value: x, scale: "x", optional: true },
      y: { value: y, scale: "y", optional: true },
    };
    this.options = options;
    this.fill = fill ?? (() => "steelblue");
    this.stroke = stroke ?? (() => "white");
  }

  render: RenderFunction = (index, scales, channels, dimensions, context) => {
    const {
      startAngle: SA,
      endAngle: EA,
      innerRadius: RI,
      outerRadius: RO,
      x: X = [],
      y: Y = [],
    } = channels;

    const indexAccessor = (arr?: number[]) => (i: unknown) =>
      arr?.[i as number] ?? 0;

    const arcGen = shapeArc()
      .startAngle(indexAccessor(SA))
      .endAngle(indexAccessor(EA))
      .innerRadius(indexAccessor(RI))
      .outerRadius(indexAccessor(RO));

    const fillFn = scales.color
      ? (i: number) => scales?.color?.(this.fill(this.data[i]))
      : (i: number) => this.fill(this.data[i]);

    const g = create("svg:g");

    for (let i = 0; i < this.data.length; ++i) {
      g.append("path")
        .attr("d", arcGen(i as any))
        .attr("fill", fillFn(i))
        .attr("stroke", this.stroke ? this.stroke(this.data[i]) : "white")
        .attr(
          "transform",
          `translate(${+(X as number[])[i]},${(Y as number[])[i]})`
        );
    }

    return g.node() as SVGElement;
  };
}

export function arc(data: PieData[], options: ArcOptions) {
  return new Arc(data, options);
}
