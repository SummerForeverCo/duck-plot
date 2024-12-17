import type { DuckPlot } from "..";
import { Data } from "../types";
import { group, sum } from "d3-array";
import { hierarchy, treemap } from "d3-hierarchy";

export function prepareTreemapData(
  data: Data | undefined,
  instance: DuckPlot
): Data | [] {
  if (!data) return [];
  const { width, height } = instance.derivePlotOptions();

  // Group data by series
  const total = sum(data, (d) => d.y || 0);
  const groupedData = Array.from(
    group(data, (d) => d.series || d.text || false),
    ([key, values]) => ({
      name: key,
      children: values.map((v) => ({
        name: v.series, // TODO: think about this.... maybe rename to category
        ...v,
        percent: ((v.y / total) * 100).toFixed(1),
      })),
    })
  );

  // Create a root node
  const root: any = hierarchy({
    name: "root",
    children: groupedData,
  })
    .sum((d: any) => d.y || 0)
    .sort((a, b) => b.y! - a.y!);

  treemap()
    .size([width ?? 500, height ?? 500])
    .padding(1)(root);
  return root.leaves();
}
