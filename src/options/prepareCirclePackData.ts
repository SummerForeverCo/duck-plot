import type { DuckPlot } from "..";
import { Data } from "../types";
import { hierarchy, pack } from "d3-hierarchy";
import { group, sum } from "d3-array";

// prepareCirclePackData
export function prepareCirclePackData(
  data: Data | undefined,
  instance: DuckPlot
) {
  if (!data) return [];
  const { width, height } = instance.derivePlotOptions();

  // Group data by series
  const total = sum(data, (d) => d.y || 0);
  const groupedData = Array.from(
    group(data, (d) => d.series || false),
    ([key, values]) => ({
      name: key,
      children: values.map((v) => ({
        name: v.series, // Consider renaming to "category"
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

  // Use the pack layout to calculate positions
  pack()
    .size([width ?? 500, height ?? 500])
    .padding(3)(root);
  return root;
}
