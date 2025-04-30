import { arc as shapeArc } from "d3-shape";
import { create } from "d3-selection";
import { Mark } from "@observablehq/plot"; // assuming Mark is public (or you copy it)
import { PieData } from "../types";

export class Arc extends Mark {
  data: PieData[];
  channels: any;
  options: any;
  fill: (d: any) => string;
  stroke: (d: any) => string;
  constructor(data: PieData[], options: any = {}) {
    super(); // ✅ no arguments!

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

  render(index, scales, channels, dimensions, context) {
    const {
      startAngle: SA,
      endAngle: EA,
      innerRadius: RI,
      outerRadius: RO,
      x: X = constant(0),
      y: Y = constant(0),
    } = channels;

    const arcGen = shapeArc()
      .startAngle((i) => SA[i])
      .endAngle((i) => EA[i])
      .innerRadius((i) => RI[i])
      .outerRadius((i) => RO[i]);

    const fillFn = scales.color
      ? (i) => scales.color(this.fill(this.data[i]))
      : (i) => this.fill(this.data[i]);

    const g = create("svg:g");

    for (let i = 0; i < this.data.length; ++i) {
      g.append("path")
        .attr("d", arcGen(i))
        .attr("fill", fillFn(i))
        .attr("stroke", this.stroke ? this.stroke(this.data[i]) : "white")
        .attr("transform", `translate(${X[i]},${Y[i]})`);
    }

    return g.node() as SVGElement;
  }
}
const constant = (x) => () => x;
export function arc(data, options) {
  return new Arc(data, options);
}
