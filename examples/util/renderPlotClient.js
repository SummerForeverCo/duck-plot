// renderPlotClient.js
import { createDb } from "./createDb.js";
import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
let DuckPlot;

if (typeof window !== "undefined") {
  // Client-side
  DuckPlot = (await import("../../src/index.ts")).DuckPlot;
} else {
  // Server-side
  DuckPlot = (await import("../../dist/index.cjs")).DuckPlot;
}
export async function renderPlot(
  fileName,
  codeString,
  constructorOptions,
  onClick,
  customRender,
  catalog = "main"
) {
  try {
    const db = await createDb(fileName, catalog);
    const duckplot = constructorOptions
      ? new DuckPlot(db, constructorOptions)
      : new DuckPlot(db);
    Function(
      "duckplot",
      "db",
      "Plot",
      "d3",
      "onClick",
      "customRender",
      codeString
    )(duckplot, db, Plot, d3, onClick, customRender);
    const plot = await duckplot.render();
    return [plot, codeString];
  } catch (error) {
    console.error("Error creating plot:", error);
    return [null, codeString];
  }
}
