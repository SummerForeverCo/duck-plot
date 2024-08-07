import { createDb } from "../util/createDb.js";
export async function incomePlot(duckplot) {
  const plot = await createDb("income.csv")
    .then(async (db) => {
      const chart = duckplot
        .data({ ddb: db, table: "income" })
        .columns({ x: "month", y: "consensus_income", series: "validator" })
        .type("line");

      return await chart.plot();
    })
    .catch(console.error);
  return plot;
}
