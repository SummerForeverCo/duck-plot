import { createDb } from "../util/createDb.js";
export async function line(duckplot) {
  const plot = await createDb("income.csv")
    .then(async (db) => {
      const chart = duckplot
        .data({ ddb: db, table: "income" })
        .columns({ x: "month", y: "consensus_income" })
        .type("line");

      return await chart.plot();
    })
    .catch(console.error);
  // for display
  const codeString = `duckplot
  .data({ ddb: db, table: "income" })
  .columns({ x: "month", y: "consensus_income", series: "validator" })
  .type("line");`;
  return [plot, codeString];
}
