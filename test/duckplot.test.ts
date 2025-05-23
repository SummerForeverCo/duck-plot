import { describe, it, expect, beforeEach } from "vitest";
import { JSDOM } from "jsdom";
import { DuckPlot } from "../src";
import { createDbServer } from "../examples/util/createDbServer";
import type { AsyncDuckDB } from "@duckdb/duckdb-wasm";

// Not testing the font measurment here
const fakeFont = {
  getAdvanceWidth: () => 10,
};

describe("DuckPlot", () => {
  let plot: any;
  let jsdom: JSDOM;
  let ddb: AsyncDuckDB;

  beforeEach(async () => {
    jsdom = new JSDOM();
    ddb = await createDbServer("stocks.csv");
    plot = new DuckPlot(ddb, { jsdom, font: fakeFont });
  });

  describe("constructor", () => {
    it("should initialize with jsdom and font", () => {
      expect(plot["_isServer"]).toBe(true);
      expect(plot["_document"]).toBe(jsdom.window.document);
    });
  });

  describe("table()", () => {
    it("should set and get table name", () => {
      plot.table("tableName");
      expect(plot.table()).toEqual("tableName");
      expect(plot["_newDataProps"]).toBe(true);
    });
  });

  describe("x()", () => {
    it("should set and get x config", () => {
      plot.x("x", { axis: "top" });
      expect(plot.x()).toEqual({ column: "x", options: { axis: "top" } });
      expect(plot["_newDataProps"]).toBe(true);
    });
  });

  describe("type()", () => {
    it("should set and get chart type", () => {
      plot.mark("line");
      expect(plot.mark()).toEqual({ type: "line" });
      expect(plot["_newDataProps"]).toBe(true);
    });
  });

  describe("config()", () => {
    it("should set and get plot config", () => {
      const config = { width: 500, height: 300 };
      plot.config(config);
      expect(plot.config()).toEqual(config);
    });
  });

  describe("prepareChartData()", () => {
    it("should throw an error if table is not set", async () => {
      await expect(plot.prepareData()).rejects.toThrow("Table not set");
    });

    it("should prepare chart data when data is set", async () => {
      plot.table("stocks").x("Date").y("Close").mark("line");
      const data = await plot.prepareData();
      expect(data).toBeDefined();
      expect(plot["_newDataProps"]).toBe(false);
    });
  });

  describe("render()", () => {
    it("should render an error message if the table isn't set", async () => {
      const result = await plot.render();
      const errorMessage = result.firstChild.textContent;
      expect(errorMessage).toEqual("Error rendering plot: Table not set");
    });

    it("should render an SVG element when everything is set", async () => {
      plot.table("stocks").x("Date").y("Close").mark("line");
      const result = await plot.render();
      expect(result).toBeDefined();
      expect(result!.nodeName).toBe("DIV");
      expect(result!.firstChild!.nodeName).toBe("svg");
    });

    it("should render a legend", async () => {
      plot.table("stocks").x("Date").y(["Close", "Open"]).mark("line");

      const result = await plot.render();
      expect(result!.querySelector(".legend")).toBeDefined();
    });
  });
});
