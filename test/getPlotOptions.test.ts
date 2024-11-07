import {
  getDataOrder,
  getMarkOptions,
  getSorts,
  getTickFormatter,
  getTopLevelPlotOptions,
  truncateText,
} from "../src/getPlotOptions";
import type { ChartData } from "../src/types";
import { describe, expect, it } from "vitest";

describe("getMarkOptions", () => {
  it("for a line chart with series, the *stroke* should be set to the series", () => {
    const result = getMarkOptions(["series"], "line", {}, {});
    expect(result).toHaveProperty("stroke", "series");
  });

  it("for not-line charts with series, the *fill* should be set to the series", () => {
    const result = getMarkOptions(["series"], "areaY", {}, {});
    expect(result).toHaveProperty("fill", "series");
  });

  it("should return the correct options when fy is included", () => {
    const result = getMarkOptions(["fy"], "line", {}, {});
    expect(result).toHaveProperty("fy", "fy");
  });
  it("should use custom x and y labels in the tooltip", () => {
    const result = getMarkOptions(
      ["x", "y"],
      "line",
      {},
      {
        xLabel: "Custom X Axis",
        yLabel: "Custom Y Axis",
      }
    );
    expect(result).toHaveProperty("channels", {
      xCustom: {
        label: "Custom X Axis",
        value: "x",
      },
      yCustom: {
        label: "Custom Y Axis",
        value: "y",
      },
    });
  });
});

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

describe("getSorts", () => {
  it("should return an empty object if currentColumns is empty", () => {
    const data = [
      { category: "A" },
      { category: "B" },
      { category: "A" },
      { category: "C" },
    ];
    const result = getSorts([], data);
    expect(result).toEqual({});
  });

  it("should return an empty object if data is undefined", () => {
    const result = getSorts(["category"], undefined);
    expect(result).toEqual({});
  });

  it("should return the correct sorts for string columns", () => {
    let data: ChartData = [
      { x: "B", y: 1, series: "CategoryB" },
      { x: "A", y: 1, series: "CategoryA" },
      { x: "C", y: 1, series: "CategoryD" },
    ];
    data.types = { x: "string", y: "number", series: "string" };
    const result = getSorts(["x", "y", "series"], data);
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
  it("should return correct width and height", () => {
    const result = getTopLevelPlotOptions([], [], {}, "barY", {
      width: 800,
      height: 600,
    });
    expect(result.height).toEqual(600);
    expect(result.width).toEqual(800);
  });

  it("should include labels and formatters for x and y if in currentColumns", () => {
    let data: ChartData = [
      { x: "B", y: 1, series: "CategoryB" },
      { x: "A", y: 1, series: "CategoryA" },
      { x: "C", y: 1, series: "CategoryD" },
    ];
    data.types = { x: "string", y: "number", series: "string" };
    const result = getTopLevelPlotOptions(data, ["x", "y"], {}, "barY", {
      x: { label: "X Axis" },
      y: { label: "Y Axis" },
    });

    expect(result.x).toEqual(
      expect.objectContaining({
        label: "X Axis",
        tickFormat: expect.any(Function),
      })
    );

    expect(result.y).toEqual(
      expect.objectContaining({
        label: "Y Axis",
        labelAnchor: "top",
      })
    );
  });

  it("should include sorts in x and y axis options if provided", () => {
    const sorts = {
      x: { domain: ["a", "b", "c"] },
      y: { domain: ["1", "2", "3"] },
    };
    const result = getTopLevelPlotOptions([], [], sorts, "barY", {});
    expect(result.x).toEqual(expect.objectContaining(sorts.x));
    expect(result.y).toEqual(expect.objectContaining(sorts.y));
  });

  it("should handle fy sort option and insetTop if provided", () => {
    const sorts = { fy: { domain: ["a", "b", "c"] } };
    const result = getTopLevelPlotOptions([], ["fy"], sorts, "barY", {});
    expect(result.fy).toEqual(
      expect.objectContaining({
        domain: ["a", "b", "c"],
        axis: null,
        label: null,
      })
    );
    expect(result.insetTop).toBe(12);
  });
});
