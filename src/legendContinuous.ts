// legendContinuous.ts
import * as Plot from "@observablehq/plot";
import { PlotOptions } from "@observablehq/plot";
export function legendContinuous(options: PlotOptions): HTMLDivElement {
  return Plot.legend(options) as HTMLDivElement;
}
