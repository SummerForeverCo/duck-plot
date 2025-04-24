import { describe, it, expect, beforeEach } from "vitest";
import { checkForConfigErrors } from "../src/helpers";
import { DuckPlot } from "../src/";
import { createDbServer } from "../examples/util/createDbServer";
import { JSDOM } from "jsdom";
import { AsyncDuckDB } from "@duckdb/duckdb-wasm";

// Not testing the font measurment here
const fakeFont = {
  getAdvanceWidth: () => 10,
};

describe("checkForConfigErrors", () => {
  let plot: any;
  let jsdom: JSDOM;
  let ddb: AsyncDuckDB;

  beforeEach(async () => {
    jsdom = new JSDOM();
    ddb = await createDbServer("stocks.csv");
    plot = new DuckPlot(ddb, { jsdom, font: fakeFont });
  });
  it("throws an error if the database is not set", () => {
    const instance = new DuckPlot(null, { jsdom: new JSDOM(), font: fakeFont });
    expect(() => checkForConfigErrors(instance)).toThrow("Database not set");
  });

  it("throws an error if the table is not set", async () => {
    expect(() => checkForConfigErrors(plot)).toThrow("Table not set");
  });

  it("throws an error if the mark type is not set", () => {
    plot.table("tableName");
    expect(() => checkForConfigErrors(plot)).toThrow(
      "Mark type or mark column not set"
    );
  });

  it("throws an error if multiple x columns are used but mark type is not barX", () => {
    plot.table("table").mark("dot").x(["col1", "col2"], { axis: "top" });

    expect(() => checkForConfigErrors(plot)).toThrow(
      "Multiple x columns only supported for barX type"
    );
  });

  it("throws an error if multiple y columns are used with barX type", () => {
    plot.table("table").mark("barX").y(["col1", "col2"], { axis: "top" });
    expect(() => checkForConfigErrors(plot)).toThrow(
      "Multiple y columns not supported for barX or rectX type"
    );
  });

  it("throws an error if markColumn is set but rawData is not", () => {
    plot.table("table").markColumn("mockColumn");
    expect(() => checkForConfigErrors(plot)).toThrow(
      "You must supply rawData to use markColumn"
    );
  });

  it("throws an error if markColumn and mark are set", () => {
    plot
      .table("table")
      .rawData([{ a: 1 }], { a: "number" })
      .mark("barX")
      .markColumn("mockColumn");
    expect(() => checkForConfigErrors(plot)).toThrow(
      "You cannot use both a markColumn and a mark type"
    );
  });

  it("throws an error if multiple x columns are used for treemap", () => {
    plot.table("table").mark("treemap").x(["col1", "col2"]);
    expect(() => checkForConfigErrors(plot)).toThrow(
      "Multiple x columns not supported for treemap type"
    );
  });

  it("throws an error if multiple y columns are used for treemap", () => {
    plot.table("table").mark("treemap").y(["col1", "col2"]);
    expect(() => checkForConfigErrors(plot)).toThrow(
      "Multiple y columns not supported for treemap type"
    );
  });

  it("throws an error if multiple color columns are used for treemap", () => {
    plot.table("table").mark("treemap").color(["col1", "col2"]);
    expect(() => checkForConfigErrors(plot)).toThrow(
      "Multiple color columns not supported for treemap type"
    );
  });

  it("throws an error if faceting is used for treemap", () => {
    plot.table("table").mark("treemap").fx("facetCol");
    expect(() => checkForConfigErrors(plot)).toThrow(
      "Faceting not supported for treemap type"
    );
    plot.fx(null).fy("facetCol");
    expect(() => checkForConfigErrors(plot)).toThrow(
      "Faceting not supported for treemap type"
    );
  });

  it("throws an error if multiple x columns are used for circlePack", () => {
    plot.table("table").mark("circlePack").x(["col1", "col2"]);
    expect(() => checkForConfigErrors(plot)).toThrow(
      "Multiple x columns not supported for circlePack type"
    );
  });

  it("throws an error if multiple y columns are used for circlePack", () => {
    plot.table("table").mark("circlePack").y(["col1", "col2"]);
    expect(() => checkForConfigErrors(plot)).toThrow(
      "Multiple y columns not supported for circlePack type"
    );
  });

  it("throws an error if multiple color columns are used for circlePack", () => {
    plot.table("table").mark("circlePack").color(["col1", "col2"]);
    expect(() => checkForConfigErrors(plot)).toThrow(
      "Multiple color columns not supported for circlePack type"
    );
  });

  it("throws an error if faceting is used for circlePack", () => {
    plot.table("table").mark("circlePack").fx("facetCol");
    expect(() => checkForConfigErrors(plot)).toThrow(
      "Faceting not supported for circlePack type"
    );

    plot.fx(null).fy("facetCol");
    expect(() => checkForConfigErrors(plot)).toThrow(
      "Faceting not supported for circlePack type"
    );
  });

  it("does not throw an error for valid treemap configuration", () => {
    plot.table("table").mark("treemap").x("col1").y("col2").color("col3");
    expect(() => checkForConfigErrors(plot)).not.toThrow();
  });

  it("does not throw an error for valid circlePack configuration", () => {
    plot.table("table").mark("circlePack").x("col1").y("col2").color("col3");
    expect(() => checkForConfigErrors(plot)).not.toThrow();
  });

  it("does not throw an error for a valid configuration", () => {
    plot.table("table").mark("barX");
    expect(() => checkForConfigErrors(plot)).not.toThrow();
  });

  it("throws an error if unsupported columns are specified for pie charts", () => {
    plot.table("table").mark("pie").x("col1");
    expect(() => checkForConfigErrors(plot)).toThrow(
      "Pie charts only support y (size) and color (category) columns"
    );
  });
});
