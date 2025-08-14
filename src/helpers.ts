import { AsyncDuckDB } from "@duckdb/duckdb-wasm";
import { quoteColumns } from "./data/query";
import { runQuery } from "./data/runQuery";
import {
  BasicColumnType,
  Data,
  ChartType,
  ColumnType,
  DescribeSchema,
  Indexable,
  TypesObject,
} from "./types";
import { DuckPlot } from ".";
import { isColor } from "./options/getPlotOptions";

export async function checkDistinct(
  duckDB: AsyncDuckDB,
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

const supportsAggregation = [
  "barY",
  "barX",
  "line",
  "areaY",
  "rectY",
  "rectX",
  "treemap",
  "circlePack",
  "pie",
];

export function allowAggregation(chartType?: ChartType) {
  return chartType && supportsAggregation.includes(chartType);
}

export const columnTypes = async (
  db: AsyncDuckDB,
  name: string
): Promise<Map<string, string>> => {
  const parts = name.split(".");
  const [catalog, table] = parts.length === 2 ? parts : ["main", parts[0]];
  if (catalog !== "main") {
    await runQuery(db, `USE ${catalog}`);
  }

  // Now use information_schema.columns — scoped to current catalog
  const types = await runQuery(
    db,
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}'`
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
  let formatted: Data = [];
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

export function processRawData(instance: DuckPlot): Data {
  const rawData = instance.rawData();
  if (!rawData || !rawData.types) return [];

  // Helper function to determine if a column defined
  const colIsDefined = (key: string, col?: ColumnType): boolean =>
    !(key === "series" && isColor(col)) &&
    col !== "" &&
    col !== undefined &&
    typeof col === "string";

  // Define column mappings for data, types, and labels
  // TODO: if we rename series to color this should get simpler
  const columnMappings = [
    { key: "x", column: instance.x().column },
    { key: "y", column: instance.y().column },
    { key: "series", column: instance.color().column },
    { key: "fy", column: instance.fy().column },
    { key: "fx", column: instance.fx().column },
    { key: "r", column: instance.r().column },
    { key: "text", column: instance.text().column },
    { key: "markColumn", column: instance.markColumn().column },
  ];

  // Map over raw data to extract chart data based on defined columns
  const dataArray: Data = rawData.map((d) =>
    Object.fromEntries(
      columnMappings
        .filter(({ key, column }) => colIsDefined(key, column))
        .map(({ key, column }) => [key, d[column as string]])
    )
  );

  // Extract types based on the defined columns
  const dataTypes = Object.fromEntries(
    columnMappings
      .filter(({ key, column }) => colIsDefined(key, column))
      .map(({ key, column }) => [key, rawData?.types?.[column as string]])
  );

  // Extract labels based on the defined columns
  const dataLabels = Object.fromEntries(
    columnMappings
      .filter(({ column }) => column)
      .map(({ key, column }) => [key, column])
  );
  dataArray.types = dataTypes;
  dataArray.labels = dataLabels;
  return dataArray;
}

// Funciton to filter down a dataset based on either a continuous range or a
// set of values for the series column
export function filterData(
  data: Data,
  visibleSeries?: string[],
  seriesDomain?: any[]
): Data {
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

export const checkForConfigErrors = (instance: DuckPlot) => {
  const rawData = instance.rawData();
  if (rawData && !rawData.types) {
    throw new Error(
      "You must include column types when specifying .rawData(data, types)"
    );
  }
  if (!instance.ddb && !rawData) throw new Error("Database not set");
  if (!instance.table() && !rawData) throw new Error("Table not set");
  const type = instance.mark().type;
  if (!type && !instance.markColumn().column)
    throw new Error("Mark type or mark column not set");
  const multipleX =
    Array.isArray(instance.x().column) && instance.x().column.length > 1;
  const multipleY =
    Array.isArray(instance.y().column) && instance.y().column.length > 1;
  const multipleColor =
    Array.isArray(instance.color().column) &&
    instance.color().column.length > 1;

  // Type specific tests
  if (type === "treemap" || type === "circlePack") {
    if (multipleX)
      throw new Error(`Multiple x columns not supported for ${type} type`);
    if (multipleY)
      throw new Error(`Multiple y columns not supported for ${type} type`);
    if (multipleColor)
      throw new Error(`Multiple color columns not supported for ${type} type`);
    if (instance.fx().column || instance.fy().column)
      throw new Error(`Faceting not supported for ${type} type`);
  } else if (type === "barX" || type === "rectX") {
    if (multipleY)
      throw new Error(
        "Multiple y columns not supported for barX or rectX type"
      );
  } else if (type === "pie") {
    if (instance.x().column || instance.fx().column || instance.fy().column)
      throw new Error(
        "Pie charts only support y (size) and color (category) columns"
      );
  } else {
    if (multipleX)
      throw new Error("Multiple x columns only supported for barX type");
  }

  // Using rawData and/or markColumn checks
  if (instance.markColumn().column && !instance.rawData())
    throw new Error("You must supply rawData to use markColumn");
  if (instance.markColumn().column && Object.keys(instance.mark()).length)
    throw new Error("You cannot use both a markColumn and a mark type");
};

// Used for pie chart class name assignment for custom rendering
export function toSafeClassName(str: string) {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\-_]/g, "-"); // Replace non-alphanum with dashes
}
