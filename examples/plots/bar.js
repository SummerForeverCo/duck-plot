import { createDb } from "../util/createDb.js";
export async function bar(duckplot) {
  const plot = await createDb("income.csv")
    .then(async (db) => {
      const chart = duckplot
        .data({ ddb: db, table: "income" })
        .columns({ x: "month", y: "consensus_income", series: "validator" })
        .type("barY");

      return await chart.plot();
    })
    .catch(console.error);
  // for display
  const codeString = `duckplot
  .data({ ddb: db, table: "income" })
  .columns({ x: "month", y: "consensus_income", series: "validator" })
  .type("barY");`;
  return [plot, codeString];
}
