import { DuckPlot } from "../src";
import {
  getDataOrder,
  getSorts,
  getTickFormatter,
  getPlotOptions,
  truncateText,
} from "../src/options/getPlotOptions";
import type { Data } from "../src/types";
import { beforeEach, describe, expect, it } from "vitest";
const fakeFont = {
  getAdvanceWidth: () => 10,
};

import { JSDOM } from "jsdom";

const jsdom = new JSDOM(`
<!DOCTYPE html>
<head>
  <meta charset="UTF-8">
</head>
<body></body>`);

describe("getDataOrder", () => {
  it("should return undefined if data is undefined", () => {
    const result = getDataOrder(undefined, "column");
    expect(result).toBeUndefined();
  });

  it("should return the correct domain when data is empty", () => {
    const result = getDataOrder([], "column");
    expect(result).toEqual({ domain: [] });
  });

  it("should return the correct domain when column is not present in data", () => {
    const data = [{ name: "Alice" }, { name: "Bob" }];
    const result = getDataOrder(data, "age");
    expect(result).toEqual({ domain: [undefined] });
  });

  it("should return the correct domain with unique values", () => {
    const data = [
      { category: "A" },
      { category: "B" },
      { category: "A" },
      { category: "C" },
    ];
    const result = getDataOrder(data, "category");
    expect(result).toEqual({ domain: ["A", "B", "C"] });
  });
});

// Note, getSorts expects a DuckPlot instance, but it's ok to pass in a fake
// arg. and still test the functionality by including columsn and data
describe("getSorts", () => {
  let plot: any;
  let jsdom: JSDOM;

  beforeEach(async () => {
    jsdom = new JSDOM();
    plot = new DuckPlot(null, { jsdom, font: fakeFont });
  });
  it("should return an empty object if currentColumns is an empty array", async () => {
    const data = [
      { category: "A" },
      { category: "B" },
      { category: "A" },
      { category: "C" },
    ];
    plot.rawData(data, { category: "string" });

    await plot.prepareData();

    const result = getSorts(plot, [], data);
    expect(result).toEqual({});
  });

  it("should return an empty object if data is an empty array", () => {
    const result = getSorts(plot, ["category"], []);
    expect(result).toEqual({});
  });

  it("should return the correct sorts for string columns", async () => {
    let data: Data = [
      { x: "B", y: 1, series: "CategoryB" },
      { x: "A", y: 1, series: "CategoryA" },
      { x: "C", y: 1, series: "CategoryD" },
    ];
    const types = { x: "string", y: "number", series: "string" };
    plot.rawData(data, types).x("x").y("y").color("series");
    await plot.prepareData();
    const result = getSorts(plot, ["x", "y", "series"]);
    expect(result).toEqual({
      x: { domain: ["B", "A", "C"] },
      series: { domain: ["CategoryB", "CategoryA", "CategoryD"] },
    });
  });
});

describe("truncateText", () => {
  it("has a maximum of 30 characters, regardless of the height", () => {
    const text = "This is a long text that needs to be truncated";
    const result = truncateText(text, "x", 100, 10000);
    expect(result).toBe(text.substring(0, 30) + "…");
  });

  it("should truncate text correctly based on height for direction y", () => {
    const text = "This is a long text that needs to be truncated";
    const result = truncateText(text, "y", 20, 100);
    expect(result).toBe("T…");
  });

  it("should not truncate short text", () => {
    const text = "Short text";
    const result = truncateText(text, "x", 100, 200);
    expect(result).toBe("Short text");
  });
});

describe("getTickFormatter", () => {
  it("should return a tick formatter that truncates text for string columns", () => {
    const result = getTickFormatter("string", "x", 100, 20);
    expect(result).toEqual({ tickFormat: expect.any(Function) });
    if (typeof result.tickFormat === "function")
      expect(
        result.tickFormat("This is a long text that needs to be truncated")
      ).toBe("T…");
  });
});

describe("getTopLevelPlotOptions", () => {
  let plot: any;
  let jsdom: JSDOM;
  beforeEach(async () => {
    jsdom = new JSDOM();
    plot = new DuckPlot(null, { jsdom, font: fakeFont });
  });
  it("should return correct width and height", () => {
    // Set options dynamically
    plot.options({ width: 800, height: 600 });

    // Call the function under test
    const result = getPlotOptions(plot);

    // Assert the results
    expect(result.height).toEqual(600);
    expect(result.width).toEqual(800);
  });

  it("should include labels for x and y", async () => {
    // Set options dynamically
    plot.options({
      x: { label: "X Axis" },
      y: { label: "And a Y Axis" },
    });

    // Call the function under test
    const result = getPlotOptions(plot);

    // Assertions
    expect(result.x).toMatchObject({ label: "X Axis" });
    expect(result.y).toMatchObject({ label: "And a Y Axis" });
  });

  it("should include sorts in x and y axis options if provided", () => {
    const sorts = {
      x: { domain: ["a", "b", "c"] },
      y: { domain: ["1", "2", "3"] },
    };
    // Set domains
    plot.rawData([], {}).options(sorts);

    const result = getPlotOptions(plot);
    expect(result.x).toEqual(expect.objectContaining(sorts.x));
    expect(result.y).toEqual(expect.objectContaining(sorts.y));
  });

  it("should handle fy sort option", () => {
    const sorts = { fy: { domain: ["a", "b", "c"] } };
    // Set domains
    plot
      .rawData([{ fy: "a" }], { fy: "string" })
      .fy("fy")
      .options(sorts);

    const result = getPlotOptions(plot);
    expect(result.fy).toEqual(
      expect.objectContaining({
        domain: ["a", "b", "c"],
      })
    );
  });
});
