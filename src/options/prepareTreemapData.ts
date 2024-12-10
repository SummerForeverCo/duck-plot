import type { DuckPlot } from "..";
import { Data, Indexable } from "../types";
import { group, sum } from "d3-array";
import { hierarchy, HierarchyNode, treemap } from "d3-hierarchy";

interface TreemapNode {
  name: string;
  children?: TreemapNode[]; // Recursive structure for children
  y?: number; // Include `y` for leaf nodes
}
export function prepareTreemapData(
  data: Data | undefined,
  instance: DuckPlot
): Data | [] {
  if (!data) return [];
  // Group data by series
  const total = sum(data, (d) => d.y || 0);
  const groupedData = Array.from(
    group(data, (d) => d.series),
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
    .sum((d: any) => d.y || 0) // Sum up the `y` values for treemap layout
    .sort((a, b) => b.y! - a.y!); // Sort nodes by value

  // TODO real width and height
  treemap().size([500, 500]).padding(1)(root);
  return root.leaves();
}
