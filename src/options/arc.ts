import { arc as shapeArc } from "d3-shape";
import { create } from "d3-selection";
import { Mark } from "@observablehq/plot";
import type { RenderFunction } from "@observablehq/plot";
import { ArcOptions, PieData } from "../types";

export class Arc extends Mark {
  data: PieData[];
  channels: any;
  options: ArcOptions;
  fill: (d: any) => string;
  customRender: RenderFunction | undefined;
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
      customRender,
      ...rest
    } = options;

    this.data = data;
    this.customRender = customRender;
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
  }

  render: RenderFunction = (index, scales, channels, dimensions, context) => {
    // This is a bit of a workaround that supports the *side effects* of
    // customRender() functions while still rendering the mark.
    if (this.customRender) {
      this.customRender(index, scales, channels, dimensions, context);
    }
    const {
      startAngle: SA,
      endAngle: EA,
      innerRadius: RI,
      outerRadius: RO,
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
        .attr("transform", `translate(${scales.x?.(0)},${scales.y?.(0)})`);
    }

    return g.node() as SVGElement;
  };
}

export function arc(data: PieData[], options: ArcOptions) {
  return new Arc(data, options);
}
