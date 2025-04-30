// makePieMarks.ts
import { pie as d3pie, arc as d3arc } from "d3-shape";
import { sum } from "d3-array";
import { Data, PieData } from "../types";

export function makePieMarks(
  data: PieData[],
  {
    value = (d: PieData) => d.y,
    fill = (d: PieData) => d.series,
    innerRadius = 0,
    outerRadius = 80,
    padAngle = 0.005,
    cx = 0,
    cy = 0,
  } = {}
) {
  const pieGen = d3pie<PieData>().value(value).padAngle(padAngle).sort(null);

  const pieData = pieGen(data);

  const arcGen = d3arc<d3.PieArcDatum<PieData>>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

  return pieData.map((d, i) => ({
    path: arcGen(d) || "",
    fill: fill(d.data),
    centroid: arcGen.centroid(d),
    data: d.data,
    index: i,
    cx,
    cy,
  }));
}
