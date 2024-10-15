import { describe, it, expect, beforeEach } from "vitest";
import { JSDOM } from "jsdom";
// @ts-expect-error: TypeScript cannot find the types but it works
import { DuckPlot } from "../dist/index.es";
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
    ddb = await createDbServer("income.csv");
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
      expect(plot.mark()).toEqual({ markType: "line" });
      expect(plot["_newDataProps"]).toBe(true);
    });
  });

  describe("config()", () => {
    it("should set and get plot config", () => {
      const config = { width: 500, height: 300 };
      plot.config(config);
      expect(plot.config()).toEqual({ ...config, hover: true });
    });
  });

  describe("prepareChartData()", () => {
    it("should throw an error if data is not set", async () => {
      await expect(plot.prepareChartData()).rejects.toThrow(
        "Database and table not set"
      );
    });

    it("should prepare chart data when data is set", async () => {
      plot.table("income").x("month").y("consensus_income").mark("line");
      const data = await plot.prepareChartData();
      expect(data).toBeDefined();
      expect(plot["_newDataProps"]).toBe(false);
    });
  });

  describe("render()", () => {
    it("should throw an error if table is not set", async () => {
      await expect(async () => {
        await plot.render();
      }).rejects.toThrow("Database and table not set");
    });

    it("should render an SVG element when everything is set", async () => {
      plot.table("income").x("month").y("consensus_income").mark("line");
      const result = await plot.render();
      expect(result).toBeDefined();
      expect(result!.nodeName).toBe("DIV");
      expect(result!.firstChild!.nodeName).toBe("svg");
    });

    it("should render a legend", async () => {
      plot
        .table("income")
        .x("month")
        .y(["consensus_income", "execution_income"])
        .mark("line");

      const result = await plot.render();
      expect(result!.querySelector(".legend")).toBeDefined();
    });
  });
});
