import { AsyncDuckDB } from "@duckdb/duckdb-wasm";
import { quoteColumns } from "./query";
import { runQuery } from "./runQuery";
import {
  BasicColumnType,
  ChartData,
  ChartType,
  ColumnType,
  DescribeSchema,
  Indexable,
  TypesObject,
} from "./types";
import { Database } from "duckdb-async";
import { DuckPlot } from ".";

export async function checkDistinct(
  duckDB: AsyncDuckDB | Database,
  tableName: string,
  cols: ColumnType
) {
  if (!duckDB || !tableName || !cols || !cols.length) return false;
  const query = `SELECT CASE WHEN count(distinct(${quoteColumns(cols)?.join(
    ", "
  )}))= count(*)
  THEN TRUE ELSE FALSE END
  FROM ${tableName};`;
  const result = await runQuery(duckDB, query);
  return Object.values(result[0])[0];
}

const supportsAggregation = ["barY", "barX", "line", "areaY"];
export function allowAggregation(chartType?: ChartType) {
  return chartType && supportsAggregation.includes(chartType);
}

export const columnTypes = async (
  db: AsyncDuckDB | Database,
  name: string
): Promise<Map<string, string>> => {
  const types = await runQuery(
    db,
    `select column_name, data_type from information_schema.columns where table_name = '${name}'`
  );

  const columns = new Map<string, string>();
  types.forEach((type: { column_name: string; data_type: string }) => {
    columns.set(type.column_name, type.data_type);
  });

  return columns;
};

export function formatResults(
  data: Indexable[],
  schema: DescribeSchema
): Record<string, any>[] {
  // Get types for each column
  let types: TypesObject = {};
  schema.forEach(
    (d) => (types[d.column_name] = getTypeCategory(d.column_type))
  );
  const selected = data;
  let formatted: ChartData = [];
  formatted =
    selected?.map((row: any) => {
      let obj: Indexable = {};
      Object.keys(row).forEach((key: string) => {
        obj[key] = coerceValue(row[key], types[key]);
      });
      return obj;
    }) || [];
  formatted.types = types;
  return formatted;
}

export function coerceValue(
  value: number | Date | string,
  columnType?: BasicColumnType
) {
  switch (columnType) {
    case "date":
      return new Date(value);
    case "number":
      return Number(value);
    default:
      return value;
  }
}

export function getTypeCategory(type?: string): BasicColumnType {
  if (!type) return undefined;
  const typeUpper = type.toUpperCase();
  const isNumber =
    typeUpper?.startsWith("DECIMAL") ||
    typeUpper?.startsWith("NUMERIC") ||
    numberTypes.includes(typeUpper);
  return isNumber
    ? "number"
    : dateTypes.includes(typeUpper)
    ? "date"
    : "string";
}

const numberTypes: string[] = [
  "BIGINT",
  "INT8",
  "LONG",
  "DOUBLE",
  "FLOAT8",
  "HUGEINT",
  "INTEGER",
  "INT4",
  "INT",
  "SIGNED",
  "REAL",
  "FLOAT4",
  "FLOAT",
  "SMALLINT",
  "INT2",
  "SHORT",
  "TINYINT",
  "INT1",
  "UBIGINT",
  "UHUGEINT",
  "UINTEGER",
  "USMALLINT",
  "UTINYINT",
];
const dateTypes: string[] = [
  "DATE",
  "INTERVAL",
  "TIME",
  "TIMESTAMP WITH TIME ZONE",
  "TIMESTAMPTZ",
  "TIMESTAMP",
  "DATETIME",
];

export function getUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function processRawData(instance: DuckPlot): ChartData {
  const rawData = instance.rawData();
  if (!rawData || !rawData.types) return [];

  // Helper function to determine if a column is a string and defined
  const isStringCol = (col?: ColumnType): boolean =>
    col !== "" && col !== undefined && typeof col === "string";

  // Define column mappings for chartData, types, and labels
  // TODO: if we rename series to color this should get simpler
  const columnMappings = [
    { key: "x", column: instance.x().column },
    { key: "y", column: instance.y().column },
    { key: "series", column: instance.color().column },
    { key: "fy", column: instance.fy().column },
    { key: "fx", column: instance.fx().column },
    { key: "r", column: instance.r().column },
    { key: "text", column: instance.text().column },
  ];

  // Map over raw data to extract chart data based on defined columns
  const chartDataArray: ChartData = rawData.map((d) =>
    Object.fromEntries(
      columnMappings
        .filter(({ column }) => isStringCol(column))
        .map(({ key, column }) => [key, d[column as string]])
    )
  );

  // Extract types based on the defined columns
  const chartDataTypes = Object.fromEntries(
    columnMappings
      .filter(({ column }) => isStringCol(column))
      .map(({ key, column }) => [key, rawData?.types?.[column as string]])
  );

  // Extract labels based on the defined columns
  const chartDataLabels = Object.fromEntries(
    columnMappings
      .filter(({ column }) => column)
      .map(({ key, column }) => [key, column])
  );
  chartDataArray.types = chartDataTypes;
  chartDataArray.labels = chartDataLabels;
  return chartDataArray;
}

// Funciton to filter down a dataset based on either a continuous range or a
// set of values for the series column
export function filterData(
  data: ChartData,
  visibleSeries?: string[],
  seriesDomain?: any[]
): ChartData {
  return visibleSeries && visibleSeries.length > 0
    ? data.filter((d) => visibleSeries.includes(`${d.series}`))
    : seriesDomain && seriesDomain.length === 2
    ? data.filter(
        (d) => d.series >= seriesDomain[0] && d.series <= seriesDomain[1]
      )
    : data;
}

export const defaultColors = [
  "rgba(255, 0, 184, 1)",
  "rgba(0, 183, 255, 1)",
  "rgba(255, 237, 0, 1)",
  "rgba(0, 202, 99, 1)",
  "rgba(255, 83, 0, 1)",
];
export const borderOptions = {
  backgroundColor: "hsla( 0 0% 100%)",
  borderColor: "rgb(228, 229, 231)",
};
