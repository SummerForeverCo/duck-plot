import * as duckdb from "@duckdb/duckdb-wasm";
import path from "path";
import { fileURLToPath } from "url";
import { default as Worker } from "web-worker";
import { readFile } from "fs/promises";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);
const duckdbWasmPath = require.resolve("@duckdb/duckdb-wasm");
const DUCKDB_DIST = path.dirname(duckdbWasmPath);

export const createDbServer = async (fileName, catalog) => {
  const tableName = fileName.replace(".csv", "").replace("-", "");
  const csvPath = path.join(__dirname, "..", "data", fileName);

  const DUCKDB_CONFIG = await duckdb.selectBundle({
    mvp: {
      mainModule: path.resolve(DUCKDB_DIST, "./duckdb-mvp.wasm"),
      mainWorker: path.resolve(DUCKDB_DIST, "./duckdb-node-mvp.worker.cjs"),
    },
  });

  const logger = new duckdb.VoidLogger();
  const worker = new Worker(DUCKDB_CONFIG.mainWorker);
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(DUCKDB_CONFIG.mainModule, DUCKDB_CONFIG.pthreadWorker);
  const conn = await db.connect();

  // Attach and use catalog if specified
  if (catalog) {
    await conn.query(`ATTACH ':memory:' AS ${catalog}`);
    await conn.query(`USE ${catalog}`);
  }

  const csvData = await readFile(csvPath, "utf-8");
  await db.registerFileText("data.csv", csvData);

  await conn.insertCSVFromPath("data.csv", {
    schema: "main",
    name: tableName,
    detect: true,
    header: true,
    delimiter: ",",
  });

  return db;
};
