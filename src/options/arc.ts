import { arc as shapeArc } from "d3-shape";
import { create } from "d3-selection";
import { Mark } from "@observablehq/plot";
import type { RenderFunction } from "@observablehq/plot";
import { ArcOptions, PieData } from "../types";
import { toSafeClassName } from "../helpers";
import { DuckPlot } from "..";

export class Arc extends Mark {
  data: PieData[];
  channels: any;
  options: ArcOptions;
  fill: (d: any) => string;
  instance: DuckPlot;
  constructor(data: PieData[], options: ArcOptions) {
    super();
    const {
      startAngle,
      endAngle,
      innerRadius,
      outerRadius,
      x,
      y,
      fill,
      instance,
      ...rest
    } = options;

    this.data = data;
    this.instance = instance;
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
    if (this.instance.config().customRender) {
      this.instance.config().customRender!.call(
        this, // ← bind Arc instance as `this`
        index,
        scales,
        channels,
        dimensions,
        context
      );
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

    const g = create("svg:g").attr("class", "arc");
    // we lose `this` context in pointer event callbacks
    const { data, instance } = this;
    // Display the tips on hover - custom handling
    for (let i = 0; i < this.data.length; ++i) {
      const series = this.data[i]?.series;
      const sliceId = `${this.instance.id()}-${series}`;
      const className = toSafeClassName(sliceId);
      g.append("path")
        .attr("d", arcGen(i as any))
        .attr("fill", fillFn(i))
        .attr("transform", `translate(${scales.x?.(0)},${scales.y?.(0)})`)
        .on("mouseenter", function () {
          // Move the arc to the top of its parent <g>
          this.parentNode?.appendChild(this);

          // Display the tooltip marks
          const tipMarks = document.getElementsByClassName(className);
          for (let i = 0; i < tipMarks.length; i++) {
            (tipMarks[i] as HTMLElement).style.visibility = "visible";
          }

          // Set the value of the plot object (as Plot does) for click events
          if (instance.plotObject) {
            instance.plotObject.value = {
              series: data[i].series,
              y: data[i].y,
            };
          }
        })
        .on("mouseleave", function (event) {
          const toElement = event.relatedTarget as HTMLElement | null;

          // If mouse is moving into the tooltip or its children, do nothing
          if (toElement && toElement.closest(`.${className}`)) {
            return;
          }

          // Hide tooltip marks
          const tipMarks = document.getElementsByClassName(className);
          for (let i = 0; i < tipMarks.length; i++) {
            (tipMarks[i] as HTMLElement).style.visibility = "hidden";
          }

          // Unset the value of the plot object
          if (instance.plotObject) {
            instance.plotObject.value = null;
          }
        });
    }

    return g.node() as SVGElement;
  };
}

export function arc(data: PieData[], options: ArcOptions) {
  return new Arc(data, options);
}
