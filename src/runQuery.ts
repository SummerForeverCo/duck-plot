import type { Table as Arrow } from "@apache-arrow/ts";
import type { AsyncDuckDB, AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";

/**
 * Execute a SQL query, and return the result as an Apache Arrow table.
 */
export const runQuery = async (db: AsyncDuckDB, sql: string): Promise<any> => {
  const conn = await db.connect();
  try {
    return await conn.query(sql);
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  } finally {
    // Ensure the connection is closed even if an error occurs
    // await conn.close();
  }
};

// export const runQueryClient = async (
//   db: AsyncDuckDB,
//   sql: string
// ): Promise<any[]> => {
//   const conn = await db.connect();
//   try {
//     const arrow = await conn.query(sql);
//     return arrow.toArray();
//   } catch (error) {
//     console.error("Error executing query:", error);
//     throw error;
//   } finally {
//     await conn.close();
//   }
// };
