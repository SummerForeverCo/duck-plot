import { arc } from "./arc"; // custom mark
import * as Plot from "@observablehq/plot";

import { truncateLabel } from "./getTipMarks";
import { Data, DuckPlotInstance } from "../types";
import { Markish } from "@observablehq/plot";

export function getGeoMarks(
  data: Data | undefined,
  instance: DuckPlotInstance
): Markish[] {
  console.log({ data });
  if (!data) return [];
  const plotOptions = instance.derivePlotOptions();
  const geoData = data.map((d) => ({ ...JSON.parse(d.x), fill: d.y }));
  console.log(geoData);
  const geoMark = Plot.geo(geoData, { fill: "fill" });
  //   const hideTip = instance.isServer || instance.config()?.tip === false;
  //   const yLabel = instance.config().tipLabels?.y ?? plotOptions.y?.label ?? "";
  //   const tipMark = hideTip
  //     ? null
  //     : Plot.tip(
  //         pieData,
  //         Plot.pointer({
  //           fill: "series",
  //           x: (d) => d.x,
  //           y: (d) => d.yPos,
  //           channels: {
  //             yCustom: {
  //               label: truncateLabel(yLabel),
  //               value: "y",
  //             },
  //             percent: {
  //               label: "Percent",
  //               value: (d) => {
  //                 const percent = (((d.y ?? 0) / total) * 100).toFixed(1);
  //                 return `${percent}%`;
  //               },
  //             },
  //           },
  //           format: {
  //             yCustom: true,
  //             percent: true,
  //             color: true,
  //             x: false,
  //             y: false,
  //           },
  //         })
  //       );

  // Additional tip marks
  //   const tipMarks = [tipMark];
  //   const otherMark = instance.config().tipMark;
  //   if (otherMark?.type) {
  //     const otherTip = Plot[otherMark.type](
  //       pieData,
  //       Plot.pointer({
  //         x: (d) => d.x,
  //         y: (d) => d.yPos,
  //         ...otherMark.options,
  //       })
  //     );
  //     tipMarks.push(otherTip);
  //   }

  return [geoMark];
}
