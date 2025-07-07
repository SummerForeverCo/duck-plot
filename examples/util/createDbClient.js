import * as duckdb from "@duckdb/duckdb-wasm";
import mvp_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url";
import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";

export const createDbClient = async (fileName, catalog = "") => {
  const tableName = fileName.replace(".csv", "").replace("-", "");

  const bundle = await duckdb.selectBundle({
    mvp: { mainModule: duckdb_wasm, mainWorker: mvp_worker },
  });
  const worker = new Worker(bundle.mainWorker);
  const logger = new duckdb.VoidLogger();
  const db = new duckdb.AsyncDuckDB(logger, worker);

  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  const conn = await db.connect();

  // Fetch the CSV file from the Vite server
  const response = await fetch(`/data/${fileName}`);
  const csvData = await response.text();

  await db.registerFileText(`data.csv`, csvData);
  const CATALOG_NAME = catalog ? catalog : "main";

  await conn.query(`ATTACH ':memory:' AS ${CATALOG_NAME}`);
  await conn.query(`USE ${CATALOG_NAME}`);

  const name = catalog ? `${catalog}.${tableName}` : tableName;
  // const name = tableName;
  console.log({ name });
  await conn.insertCSVFromPath("data.csv", {
    name,
    detect: true,
    header: true,
    delimiter: ",",
  });

  const result = await conn.query("SHOW TABLES");
  console.log({ result });

  // Safe conversion using the result schema
  const columns = result.schema.fields.map((f) => f.name);
  const rows = [];

  for (let i = 0; i < result.length; i++) {
    const row = {};
    for (const col of columns) {
      row[col] = result.get(i, col);
    }
    rows.push(row);
  }

  console.log("Tables in DB:", rows);

  const describe = await conn.query(`DESCRIBE ${name}`);
  console.log("test2");
  console.log(`DESCRIBE ${name}:`, describe.toArray());

  return db;
};
