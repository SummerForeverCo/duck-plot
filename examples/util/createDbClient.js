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
  const schema = "main";

  // Attach and use catalog if specified
  if (catalog) {
    await conn.query(`ATTACH ':memory:' AS ${catalog}`);
    await conn.query(`USE ${catalog}`);
  }

  const activeCatalog = await conn.query("PRAGMA database_list");
  console.log("Active catalogs:", toPlainObjects(activeCatalog.toArray()));
  await conn.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);

  // Use only the table name, not dot notation
  await conn.insertCSVFromPath("data.csv", {
    schema,
    name: tableName,
    detect: true,
    header: true,
    delimiter: ",",
  });

  // Query visible tables
  const result = await conn.query("SELECT * FROM duckdb_tables()");
  console.log({ duckdb_tables: toPlainObjects(result) });

  // Use DESCRIBE with schema.tableName
  const describeQuery = `DESCRIBE ${catalog}.${schema}.${tableName}`;
  const describe = await conn.query(describeQuery);
  console.log(describeQuery, toPlainObjects(describe.toArray()));

  return db;
};

export function toPlainObjects(result) {
  if (!result) return [];

  // Use toArray if available
  const rows =
    typeof result.toArray === "function"
      ? result.toArray()
      : Array.isArray(result)
      ? result
      : [];

  // Build schema object

  return rows.map((row) => {
    const obj = {};
    for (const key of Object.keys(row)) {
      obj[key] = row[key];
    }
    return obj;
  });
}
