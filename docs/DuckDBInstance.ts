import * as duckdb from "@duckdb/duckdb-wasm";
import mvp_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url";
import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";

let db: duckdb.AsyncDuckDB | null = null;

export async function getDuckDB(): Promise<duckdb.AsyncDuckDB> {
  if (db) return db;

  const bundle = await duckdb.selectBundle({
    mvp: { mainModule: duckdb_wasm, mainWorker: mvp_worker },
  });
  const worker = new Worker(bundle.mainWorker ?? "");
  const logger = new duckdb.VoidLogger();
  db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker || undefined);

  return db;
}
