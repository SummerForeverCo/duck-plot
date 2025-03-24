import { DuckPlot } from "../src";

import { JSDOM } from "jsdom";
import { describe, expect, it, vi } from "vitest";
import { createDbServer } from "../examples/util/createDbServer.js";
import { getPrimaryMarkOptions } from "../src/options/getPrimaryMarkOptions";
import { getTipMarks } from "../src/options/getTipMarks.js";
import { Indexable } from "../src/types.js";
const jsdom = new JSDOM(`
<!DOCTYPE html>
<head>
  <meta charset="UTF-8">
</head>
<body></body>`);
describe("getMarkOptions", () => {
  it("for a line chart with series, the *stroke* should be set to the series", async () => {
    const db = await createDbServer("stocks.csv");
    const plot = new DuckPlot(db, { jsdom })
      .table("stocks")
      .color("Symbol")
      .mark("line");
    await plot.prepareData();
    const result = getPrimaryMarkOptions(plot, "line"); // internally the mark is always passed
    expect(result).toHaveProperty("stroke", "series");
  });

  it("for not-line charts with series, the *fill* should be set to the series", async () => {
    const db = await createDbServer("stocks.csv");
    const plot = new DuckPlot(db, { jsdom })
      .table("stocks")
      .color("Symbol")
      .mark("areaY");
    await plot.prepareData();
    const result = getPrimaryMarkOptions(plot, "areaY"); // internally the mark is always passed
    expect(result).toHaveProperty("fill", "series");
  });

  it("should return the correct options when fy is included", async () => {
    const db = await createDbServer("stocks.csv");
    const plot = new DuckPlot(db, { jsdom })
      .table("stocks")
      .color("Symbol")
      .fy("Symbol")
      .mark("areaY");
    await plot.prepareData();

    const result = getPrimaryMarkOptions(plot, "areaY"); // internally the mark is always passed
    expect(result).toHaveProperty("fy", "fy");
  });
  it("should use custom x and y labels in the tooltip", () => {
    const plot = new DuckPlot(null, { jsdom })
      .x("a", { label: "Custom X Axis" })
      .options({
        y: {
          label: "Custom Y Axis",
        },
      })
      .rawData([{ a: 1 }], { a: "string" })
      .fy("a")
      .mark("areaY");
    // Plot.tip returns an object with a channels property, but getting a type
    // error without recasting
    const result = getTipMarks(plot) as Indexable;
    expect(result[0].channels).toHaveProperty("xCustom", {
      label: "Custom X Axis",
      value: "x",
      filter: null,
    });
    expect(result[0].channels).toHaveProperty("yCustom", {
      label: "Custom Y Axis",
      value: "y",
      filter: null,
    });
  });
});
