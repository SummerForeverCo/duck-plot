import { describe, it, expect, beforeEach } from "vitest";
import { checkForConfigErrors } from "../src/helpers";
import { DuckPlot } from "../src/";
import { createDbServer } from "../examples/util/createDbServer";
import { JSDOM } from "jsdom";
import { Database } from "duckdb-async";

// Not testing the font measurment here
const fakeFont = {
  getAdvanceWidth: () => 10,
};

describe("checkForConfigErrors", () => {
  let plot: any;
  let jsdom: JSDOM;
  let ddb: Database;

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
    expect(() => checkForConfigErrors(plot)).toThrow("Mark type not set");
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
      "Multiple y columns not supported for barX type"
    );
  });

  it("throws an error if markColumn is set but rawData is not", () => {
    plot.table("table").mark("barX").markColumn("mockColumn");
    expect(() => checkForConfigErrors(plot)).toThrow(
      "MarkColumn is only supported with rawData"
    );
  });

  it("does not throw an error for a valid configuration", () => {
    plot.table("table").mark("barX");
    expect(() => checkForConfigErrors(plot)).not.toThrow();
  });
});
