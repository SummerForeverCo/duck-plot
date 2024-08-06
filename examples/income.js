import { DuckPlot } from "../dist/duck-plot.cjs"; // Adjust the path as necessary
import { createDb } from "./init.js";
import { JSDOM } from "jsdom";
import fs from "fs";

const jsdom = new JSDOM(`
<!DOCTYPE html>
<head><meta charset="UTF-8"></head>
<body><div></div></body>`);

createDb("income.csv")
  .then(async (db) => {
    const chart = new DuckPlot(jsdom)
      .data({ ddb: db, table: "income" })
      .columns({ x: "month", y: "consensus_income", series: "validator" })
      .type("line");

    const plt = await chart.plot();
    fs.writeFileSync("examples/line.svg", plt.outerHTML);
    chart.type("barY");
    chart.series(""); // add undo
    const bar = await chart.plot();
    fs.writeFileSync("examples/bar.svg", bar.outerHTML);
  })
  .catch(console.error);
