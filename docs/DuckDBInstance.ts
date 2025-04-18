import * as duckdb from "@duckdb/duckdb-wasm";
import wasmUrl from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";
import workerUrl from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url";

let db: duckdb.AsyncDuckDB | null = null;
let loadingPromise: Promise<duckdb.AsyncDuckDB> | null = null;

export async function getDuckDB(): Promise<duckdb.AsyncDuckDB> {
  if (db) return db;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const bundle = {
      mainModule: wasmUrl,
      mainWorker: workerUrl,
    };

    const logger = new duckdb.VoidLogger();
    const worker = new Worker(bundle.mainWorker);
    const dbInstance = new duckdb.AsyncDuckDB(logger, worker);
    await dbInstance.instantiate(bundle.mainModule);
    db = dbInstance;
    return db;
  })();

  return loadingPromise;
}

const registeredTables = new Set<string>();
const loadingTables = new Map<string, Promise<void>>();

export async function registerTableOnce(
  db: duckdb.AsyncDuckDB,
  fileName: string
): Promise<void> {
  const tableName = fileName.replace(".csv", "").replace("-", "");
  if (registeredTables.has(tableName)) return;
  if (loadingTables.has(tableName)) return loadingTables.get(tableName)!;

  const promise = (async () => {
    const conn = await db.connect();
    const response = await fetch(`data/${fileName}`);
    const csvData = await response.text();

    await db.registerFileText(`${fileName}.csv`, csvData);
    await conn.insertCSVFromPath(`${fileName}.csv`, {
      schema: "main",
      name: tableName,
      detect: true,
      header: true,
      delimiter: ",",
    });

    registeredTables.add(tableName);
    loadingTables.delete(tableName);
  })();

  loadingTables.set(tableName, promise);
  return promise;
}
