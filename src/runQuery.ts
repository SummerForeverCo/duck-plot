import type { AsyncDuckDB, AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";

export const runQuery = async (db: AsyncDuckDB, sql: string): Promise<any> => {
  if (typeof window !== "undefined") {
    // Client-side
    return runQueryClient(db, sql);
  } else {
    // Server-side
    return runQueryServer(db, sql);
  }
};
const runQueryServer = async (db: any, sql: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, (err: string, res: any[]) => {
      if (err) {
        console.warn(err);
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

const runQueryClient = async (db: AsyncDuckDB, sql: string): Promise<any[]> => {
  const conn = await db.connect();
  try {
    const arrow = await conn.query(sql);
    return arrow.toArray();
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  } finally {
    await conn.close();
  }
};
