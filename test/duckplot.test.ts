import { describe, it, expect, beforeEach } from "vitest";
import { JSDOM } from "jsdom";
// @ts-expect-error: TypeScript cannot find the types but it works
import { DuckPlot } from "../dist/index.es";
import { DataConfig, ColumnsConfig, PlotConfig } from "../src/types";
import { createDbServer } from "../examples/util/createDbServer";
import { Database } from "duckdb-async";

// Not testing the font measurment here: visual inspection via npm run dev-server
const fakeFont = {
  getAdvanceWidth: () => 10,
};

describe("DuckPlot", () => {
  let plot: any;
  let jsdom: JSDOM;
  let ddb: Database;

  beforeEach(async () => {
    jsdom = new JSDOM();
    plot = new DuckPlot({ jsdom, font: fakeFont });
    ddb = await createDbServer("income.csv");
  });

  describe("constructor", () => {
    it("should initialize with jsdom and font", () => {
      expect(plot["_isServer"]).toBe(true);
      expect(plot["_document"]).toBe(jsdom.window.document);
    });
  });

  describe("data()", () => {
    it("should set and get data config", () => {
      const dataConfig: DataConfig = { ddb, table: "table" };
      plot.data(dataConfig);
      expect(plot.data()).toEqual(dataConfig);
      expect(plot["_newDataProps"]).toBe(true);
    });
  });

  describe("columns()", () => {
    it("should set and get columns config", () => {
      const columnsConfig: ColumnsConfig = { x: "x", y: "y", series: "series" };
      plot.columns(columnsConfig);
      expect(plot.columns()).toEqual(columnsConfig);
      expect(plot["_newDataProps"]).toBe(true);
    });
  });

  describe("x()", () => {
    it("should set x value when columns is null", () => {
      plot.x("xValue");
      expect(plot.x()).toEqual("xValue");
    });

    it("should set x value when columns already has values", () => {
      plot.columns({ x: "x1", y: "y1", series: "s1" });
      plot.x("xValue");
      expect(plot.x()).toEqual("xValue");
      expect(plot.columns().x).toEqual("xValue");
    });
  });

  describe("y()", () => {
    it("should set y value when columns is null", () => {
      plot.y("yValue");
      expect(plot.y()).toEqual("yValue");
    });

    it("should set y value when columns already has values", () => {
      plot.columns({ x: "x1", y: "y1", series: "s1" });
      plot.y("yValue");
      expect(plot.y()).toEqual("yValue");
      expect(plot.columns().y).toEqual("yValue");
    });
  });

  describe("series()", () => {
    it("should set series value when columns is null", () => {
      plot.series("seriesValue");
      expect(plot.series()).toEqual("seriesValue");
    });

    it("should set series value when columns already has values", () => {
      plot.columns({ x: "x1", y: "y1", series: "s1" });
      plot.series("seriesValue");
      expect(plot.series()).toEqual("seriesValue");
      expect(plot.columns().series).toEqual("seriesValue");
    });
  });

  describe("type()", () => {
    it("should set and get chart type", () => {
      plot.type("line");
      expect(plot.type()).toEqual("line");
      expect(plot["_newDataProps"]).toBe(true);
    });
  });

  describe("config()", () => {
    it("should set and get plot config", () => {
      const config: PlotConfig = { width: 500, height: 300 };
      plot.config(config);
      expect(plot.config()).toEqual(config);
    });
  });

  describe("prepareChartData()", () => {
    it("should throw an error if data is not set", async () => {
      await expect(plot.prepareChartData()).rejects.toThrow(
        "Data configuration is not set"
      );
    });

    it("should prepare chart data when data is set", async () => {
      plot
        .data({ ddb, table: "income" })
        .columns({ x: "month", y: "consensus_income" })
        .type("line");
      const data = await plot.prepareChartData();
      expect(data).toBeDefined();
      expect(plot["_newDataProps"]).toBe(false);
    });
  });

  describe("render()", () => {
    it("should return null if chart type is not set", async () => {
      const result = await plot.render();
      expect(result).toBeNull();
    });

    it.only("should render an SVG element when everything is set", async () => {
      plot
        .data({ ddb, table: "income" })
        .columns({ x: "month", y: "consensus_income" })
        .type("line");
      const result = await plot.render();
      expect(result).toBeDefined();
      expect(result!.nodeName).toBe("DIV");
      expect(result!.firstChild!.nodeName).toBe("svg");
    });

    it("should handle legend creation correctly", async () => {
      plot.data({ ddb, table: "table" });
      plot.columns({ x: "x", y: "y", series: "series" });
      plot.type("line");
      plot.config({ legendDisplay: true });
      const result = await plot.render();
      expect(result!.querySelector(".legend")).toBeDefined();
    });
  });
});