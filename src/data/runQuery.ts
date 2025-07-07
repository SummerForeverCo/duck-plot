import type { AsyncDuckDB } from "@duckdb/duckdb-wasm";
import { formatResults } from "../helpers";

export const runQuery = async (
  db: AsyncDuckDB,
  sql: string
): Promise<any[]> => {
  console.log("Running query:", sql);
  const conn = await db.connect();
  try {
    const arrow = await conn.query(sql);
    console.log(toPlainObjects(arrow.toArray()));
    return arrow.toArray();
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  } finally {
    await conn.close();
  }
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
