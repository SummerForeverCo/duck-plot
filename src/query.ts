import { buildSqlQuery } from "./buildSqlQuery";
import { Column, Config, ChartType, ChartData } from "./types";

// Function to determine if a column (either a string or array of strings) is defined
export function columnIsDefined(column: Column, config: Config) {
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
export function getTransformType(type: ChartType, { x, y, series }: Config) {
  if (type === "barX") {
    if (x && x.length > 1) {
      return series && series.length > 0 ? "unPivotWithSeries" : "unPivot";
    }
  } else {
    if (y && y.length > 1) {
      return series && series.length > 0 ? "unPivotWithSeries" : "unPivot";
    }
  }
  return "standard";
}

export function getStandardTransformQuery(
  type: ChartType,
  { x, y, series, facet }: Config,
  tableName: string,
  into: string
) {
  let select = [];
  // Very confusing case! for barYGrouped, we want the selected X to be fx, and
  // the selected series to be x.
  if (type === "barYGrouped") {
    if (x?.length && !series?.length) {
      select.push(standardColName({ x }, "x"));
    } else {
      select.push(standardColName({ x }, "x", "fx"));
      if (series?.length) {
        select.push(maybeConcatCols(series, "series"));
        select.push(maybeConcatCols(series, "x"));
      }
    }
    if (y?.length) select.push(standardColName({ y }, "y"));
    if (facet?.length) select.push(maybeConcatCols(facet, "facet"));
  } else {
    if (x?.length) select.push(standardColName({ x }, "x"));
    if (y?.length) select.push(standardColName({ y }, "y"));
    if (series?.length) select.push(maybeConcatCols(series, "series"));
    if (facet?.length) select.push(maybeConcatCols(facet, "facet"));
  }
  return buildSqlQuery({ select, into, from: tableName! });
}

export function getUnpivotQuery(
  type: ChartType,
  { x, y, facet }: Config,
  tableName: string,
  into: string
) {
  const createStatment = `CREATE TABLE ${into} as`;

  // Handling the confusing case of barYGrouped where x becomes fx and series
  // becomes x
  if (type === "barYGrouped") {
    const selectStr = `SELECT "${x}" as fx, value AS y`;
    const keysStr = quoteColumns(y)?.join(", ");
    const facetStr = facet ? `${maybeConcatCols(facet, "facet,")}` : "";
    return `${createStatment} ${selectStr}, ${facetStr} key AS x, key AS series FROM "${tableName}"
        UNPIVOT (value FOR key IN (${keysStr}));`;
  }

  const selectStr =
    type === "barX"
      ? `SELECT ${columnIsDefined("y", { y }) ? `"${y}" as y, ` : ""}value AS x`
      : `SELECT ${
          columnIsDefined("x", { x }) ? `"${x}" as x, ` : ""
        }value AS y`;
  const keysStr =
    type === "barX" ? quoteColumns(x)?.join(", ") : quoteColumns(y)?.join(", ");
  const facetStr = facet ? maybeConcatCols(facet, "facet,") : "";

  return `${createStatment} ${selectStr}, ${facetStr} key AS series FROM "${tableName}"
        UNPIVOT (value FOR key IN (${keysStr}));`;
}

export function getUnpivotWithSeriesQuery(
  type: ChartType,
  { x, y, series, facet }: Config,
  tableName: string,
  into: string
) {
  if (type === "barYGrouped") {
    const xStatement = `"${x}" as fx`;
    const yStatement = quoteColumns(y)?.join(", ");
    const unPivotStatment = `y FOR pivotCol IN (${quoteColumns(y)?.join(
      ", "
    )})`;
    const createStatment = `CREATE TABLE ${into} as`;
    return `${createStatment} SELECT
            concat_ws('-', pivotCol, series) AS x,
            y,
            concat_ws('-', pivotCol, series) AS series,
            fx,
            ${facet?.length ? "facet" : ""}
        FROM (
            SELECT
                ${xStatement},
                ${yStatement},
                ${maybeConcatCols(series, "series")},
                ${facet?.length ? maybeConcatCols(facet, "facet") : ""}
            FROM
                ${tableName}
        ) p
        UNPIVOT (
            ${unPivotStatment}
        );`;
  } else {
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
            concat_ws('-', pivotCol, series) AS series,
            ${facet?.length ? "facet" : ""}
        FROM (
          SELECT
              ${xStatement}
              ${yStatement},
              ${maybeConcatCols(series, "series")},
              ${facet?.length ? maybeConcatCols(facet, "facet") : ""}
          FROM
              ${tableName}
      ) p
      UNPIVOT (
          ${unPivotStatment}
      );`;
  }
}

// Construct SQL statement, handling aggregation when necessary
export function getTransformQuery(
  type: ChartType,
  config: Config,
  tableName: string,
  intoTable: string
) {
  // Detect what type of query we need to construct
  const transformType = getTransformType(type, omit(config, ["facet"]));
  // Return the constructe query
  if (transformType === "unPivotWithSeries") {
    return getUnpivotWithSeriesQuery(type, config, tableName, intoTable);
  } else if (transformType === "unPivot") {
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
  config: Config,
  columns: string[],
  tableName: string
): { queryString: string; labels: ChartData["labels"] } {
  // Filter out null values (the case that an empty selector has been added)
  const y = extractDefinedValues(config.y);
  const x = extractDefinedValues(config.x);

  let aggregateSelection;
  let groupBy: string[] = [];
  let labels: ChartData["labels"] = {};
  // Handling horiztonal bar charts differently (aggregate on x-axis)
  if (type === "barX") {
    if (x && x.length > 0) {
      aggregateSelection = ` sum(x::FLOAT) as x`;
      labels.x = `Sum of ${toTitleCase(x)}`;
    }
    groupBy = columns.filter((d) => d !== "x");
  } else {
    if (y && y.length > 0) {
      aggregateSelection = ` sum(y)::FLOAT as y`;
      labels.y = `Sum of ${toTitleCase(y)}`;
    }
    groupBy = columns.filter((d) => d !== "y");
  }

  return {
    queryString: buildSqlQuery({
      select: [...groupBy],
      aggregateSelection,
      from: tableName,
      groupBy,
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
  return `"${cols[0]}"${colName}`;
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
