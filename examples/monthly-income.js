import { DuckPlot } from "../dist/duck-plot.cjs"; // Adjust the path as necessary
import { createDb } from "./init.js";
createDb("monthly-income.csv")
  .then((db) => {
    const duckPlot = new DuckPlot();
    duckPlot
      .data({ ddb: db, table: "my_table" })
      .columns({ x: "date", y: "cost", series: "company", facet: "department" })
      .type("line")
      .plot();
  })
  .catch(console.error);
