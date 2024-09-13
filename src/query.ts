import { buildSqlQuery } from "./buildSqlQuery";
import {
  Column,
  ColumnConfig,
  ChartType,
  ChartData,
  Aggregate,
  QueryMap,
} from "./types";

// Function to determine if a column (either a string or array of strings) is defined
export function columnIsDefined(column: Column, config: ColumnConfig) {
  return Array.isArray(config[column])
    ? (config[column] as any[]).filter((d) => d).length > 0
    : config[column] != null && config[column] != undefined;
}

export function omit(obj: any, keys: Array<string | number>): any {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
}

// Determine what type of query we need to construct based on the config
export function getTransformType(
  type: ChartType,
  { x, y, series }: ColumnConfig
) {
  if (type === "barX") {
    if (Array.isArray(x) && x.length > 1) {
      return series?.length ? "unPivotWithSeries" : "unPivot";
    }
  } else {
    if (Array.isArray(y) && y.length > 1) {
      return series?.length ? "unPivotWithSeries" : "unPivot";
    }
  }
  return "standard";
}

export function getStandardTransformQuery(
  type: ChartType,
  { x, y, series, fy, fx }: ColumnConfig,
  tableName: string,
  into: string
) {
  let select = [];

  if (x?.length) select.push(standardColName({ x }, "x"));
  if (fx?.length) select.push(standardColName({ fx }, "fx"));
  if (y?.length) select.push(standardColName({ y }, "y"));
  if (series?.length) select.push(maybeConcatCols(series, "series"));
  if (fy?.length) select.push(maybeConcatCols(fy, "fy"));

  return buildSqlQuery({ select, into, from: tableName! });
}

export function getUnpivotQuery(
  type: ChartType,
  { x, y, fy, fx }: ColumnConfig,
  tableName: string,
  into: string
) {
  const createStatment = `CREATE TABLE ${into} as`;

  const selectStr =
    type === "barX"
      ? `SELECT ${columnIsDefined("y", { y }) ? `"${y}" as y, ` : ""}value AS x`
      : `SELECT ${columnIsDefined("fx", { fx }) ? `"${fx}" as fx, ` : ""}
        ${columnIsDefined("x", { x }) ? `"${x}" as x, ` : ""}value AS y`;
  const keysStr =
    type === "barX" ? quoteColumns(x)?.join(", ") : quoteColumns(y)?.join(", ");
  const fyStr = fy ? maybeConcatCols(fy, "fy,") : "";

  return `${createStatment} ${selectStr}, ${fyStr} key AS series${
    fx && !x ? ", key AS x" : ""
  } FROM "${tableName}"
        UNPIVOT (value FOR key IN (${keysStr}));`;
}

export function getUnpivotWithSeriesQuery(
  type: ChartType,
  { x, y, series, fy, fx }: ColumnConfig,
  tableName: string,
  into: string
) {
  const xStatement = !columnIsDefined("x", { x })
    ? ``
    : type === "barX"
    ? `${quoteColumns(x)?.join(", ")}, `
    : `"${x}" as x, `;
  const yStatement =
    type === "barX" ? `"${y}" as y` : quoteColumns(y)?.join(", ");
  const unPivotStatment =
    type === "barX"
      ? `x FOR pivotCol IN (${quoteColumns(x)?.join(", ")})`
      : `y FOR pivotCol IN (${quoteColumns(y)?.join(", ")})`;
  const createStatment = `CREATE TABLE ${into} as`;
  return `${createStatment} SELECT
            ${columnIsDefined("x", { x }) ? `x, ` : ""}
            y,
            concat_ws('-', pivotCol, series) AS series
            ${fy?.length ? ", fy" : ""}
            ${fx?.length ? ", fx" : ""}

        FROM (
          SELECT
              ${xStatement}
              ${yStatement},
              ${maybeConcatCols(series, "series")},
              ${fy?.length ? maybeConcatCols(fy, "fy") : ""}
              ${fx?.length ? `, ${maybeConcatCols(fx, "fx")}` : ""}
          FROM
              ${tableName}
      ) p
      UNPIVOT (
          ${unPivotStatment}
      );`;
}

// Construct SQL statement, handling aggregation when necessary
export function getTransformQuery(
  type: ChartType,
  config: ColumnConfig,
  tableName: string,
  intoTable: string,
  description: { value: string }
) {
  // Detect what type of query we need to construct
  const transformType = getTransformType(type, omit(config, ["fy"]));

  // Return the constructed query
  if (transformType === "unPivotWithSeries") {
    const transformColumns = type === "barX" ? config.x : config.y;
    description.value += `The columns ${transformColumns} were unpivoted and then concatenated with ${config.series}, creating colors for each column-series.\n`;
    return getUnpivotWithSeriesQuery(type, config, tableName, intoTable);
  } else if (transformType === "unPivot") {
    const transformColumns = type === "barX" ? config.x : config.y;
    description.value += `The columns ${transformColumns} were unpivoted, creating colors for each series.\n`;
    return getUnpivotQuery(type, config, tableName, intoTable);
  } else {
    return getStandardTransformQuery(type, config, tableName, intoTable);
  }
}

// Function to extract the defined values in an array, or return a string IN an
// array.
export function extractDefinedValues(
  value?: string | (string | undefined)[]
): string[] {
  if (!value) return [];
  if (!Array.isArray(value)) return [value];
  return (value.filter((d) => d) as string[]) || [];
}

// Returns both querystring and labels
export function getAggregateInfo(
  type: ChartType,
  config: ColumnConfig,
  columns: string[],
  tableName: string,
  aggregate: Aggregate | undefined, // TODO: add tests
  description: { value: string }
): { queryString: string; labels: ChartData["labels"] } {
  // Filter out null values (the case that an empty selector has been added)
  const y = extractDefinedValues(config.y);
  const x = extractDefinedValues(config.x);
  const agg = aggregate ?? "sum";
  let aggregateSelection;
  let groupBy: string[] = [];
  let labels: ChartData["labels"] = {};
  // Handling horiztonal bar charts differently (aggregate on x-axis)
  if (type === "barX") {
    if (x && x.length > 0) {
      aggregateSelection = ` ${agg}(x::FLOAT) as x`;
      labels.x = `${toTitleCase(agg)} of ${toTitleCase(x)}`;
    }
    groupBy = columns.filter((d) => d !== "x");
  } else {
    if (y && y.length > 0) {
      aggregateSelection = ` ${agg}(y)::FLOAT as y`;
      labels.y = `${toTitleCase(agg)} of ${toTitleCase(y)}`;
    }
    groupBy = columns.filter((d) => d !== "y");
  }
  description.value += `The ${
    type === "barX" ? "x" : "y"
  } values were aggregated with a ${agg} aggregation, grouped by ${groupBy.join(
    `, `
  )}.`;
  return {
    queryString: buildSqlQuery({
      select: [...groupBy],
      aggregateSelection,
      from: tableName,
      groupBy,
      // orderBy: groupBy, // TODO: unsure about removing this
    }),
    labels,
  };
}

export function maybeConcatCols(cols?: string[] | string, as?: string) {
  if (!cols || !cols.length) return "";
  const colName = as ? ` as ${as}` : "";
  const colArr = Array.isArray(cols) ? cols : [cols];
  if (colArr.length > 1) {
    return `concat_ws('-', ${colArr
      .filter((d) => d)
      .map((d) => `"${d}"`)
      .join(", ")})${colName}`;
  }
  return `"${colArr[0]}"${colName}`;
}

export function standardColName(obj: any, column: string, colName?: string) {
  // Gets the first elemetn of an array if it is an array
  const col = Array.isArray(obj[column]) ? obj[column][0] : obj[column];
  return `"${col}" as ${colName || column}`;
}

export const quoteColumns = (
  columns: string | undefined | (string | undefined)[]
) => {
  if (!columns) return [];
  return !Array.isArray(columns)
    ? [`"${columns}"`]
    : columns.map((str) => `"${str}"`);
};

export function toTitleCase(value?: string | unknown) {
  if (!value) return "";
  let str = String(value);
  // Replace underscores and dashes with spaces
  let result = str.replace(/[_-]/g, " ");

  // Add space before uppercase letters (for camel case) and ensure the first character is not unnecessarily spaced
  result = result.replace(/([a-z])([A-Z])/g, "$1 $2").trim();

  // Capitalize the first letter of each word
  result = result
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return result;
}
