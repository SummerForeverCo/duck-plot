import { Database } from "duckdb-async";
import path from "path";
import { fileURLToPath } from "url";

export const createDbServer = async (fileName) => {
  // Get the directory name of the current module
  const __filename = fileURLToPath(import.meta.url);
  let __dirname = path.dirname(__filename);
  __dirname = path.join(__dirname, "..");
  const tableName = fileName.replace(".csv", "").replace("-", "");

  const csvPath = path.join(__dirname, "data", fileName); // Constructing the absolute path to the CSV file
  // Create an in-memory DuckDB instance
  const db = await Database.create(":memory:");

  // Create a table and load CSV data into it
  await db.run(
    `CREATE TABLE ${tableName} AS SELECT * FROM read_csv_auto('${csvPath}')`
  );
  return db;
};
