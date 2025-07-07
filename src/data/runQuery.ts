import type { AsyncDuckDB } from "@duckdb/duckdb-wasm";

export const runQuery = async (
  db: AsyncDuckDB,
  sql: string
): Promise<any[]> => {
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
