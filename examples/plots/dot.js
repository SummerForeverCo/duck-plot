import { createDb } from "../util/createDb.js";
export async function dot(duckplot) {
  const plot = await createDb("income.csv")
    .then(async (db) => {
      const chart = duckplot
        .data({ ddb: db, table: "income" })
        .columns({
          x: "execution_income",
          y: "consensus_income",
          series: "execution_income",
        })
        .type("dot");

      return await chart.plot();
    })
    .catch(console.error);
  // for display
  const codeString = `duckplot
    .data({ ddb: db, table: "income" })
    .columns({ x: "execution_income", y: "consensus_income" })
    .type("dot")`;
  return [plot, codeString];
}
