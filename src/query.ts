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
  { x, y, series, fy, fx, r, text }: ColumnConfig,
  tableName: string,
  into: string
) {
  let select = [];

  if (x?.length) select.push(standardColName({ x }, "x"));
  if (fx?.length) select.push(standardColName({ fx }, "fx"));
  if (y?.length) select.push(standardColName({ y }, "y"));
  if (series?.length) select.push(maybeConcatCols(series, "series"));
  if (fy?.length) select.push(maybeConcatCols(fy, "fy"));
  if (r?.length) select.push(standardColName({ r }, "r"));
  if (text?.length) select.push(standardColName({ text }, "text"));

  return `CREATE TABLE ${into} as SELECT ${select.join(
    ", "
  )} FROM ${tableName}`;
}

export function getUnpivotQuery(
  type: ChartType,
  { x, y, fy, fx, r, text }: ColumnConfig,
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
  const rStr = r ? `${standardColName({ r }, "r")} ,` : "";
  const textStr = text ? `${standardColName({ text }, "text")} ,` : "";

  return `${createStatment} ${selectStr}, ${rStr}${textStr}${fyStr} key AS series${
    fx && !x ? ", key AS x" : ""
  } FROM "${tableName}"
        UNPIVOT (value FOR key IN (${keysStr}));`;
}

export function getUnpivotWithSeriesQuery(
  type: ChartType,
  { x, y, series, fy, fx, r, text }: ColumnConfig,
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
            ${columnIsDefined("r", { r }) ? `r, ` : ""}
            ${columnIsDefined("text", { text }) ? `text, ` : ""}
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
              ${r?.length ? `${maybeConcatCols(r, "r")}` : ""}
              ${text?.length ? `${maybeConcatCols(text, "text")}` : ""}
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

// Function to convert a string or array of strings to an array of strings
// (removes nullish values from the arrays)
export function arrayIfy(value?: string | (string | undefined)[]): string[] {
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
  description: { value: string },
  percent?: boolean
): { queryString: string; labels: ChartData["labels"] } {
  // Ensure that the x and y values are arrays
  const y = arrayIfy(config.y);
  const x = arrayIfy(config.x);
  const agg = aggregate ?? "sum";
  let aggregateSelection;
  let groupBy: string[] = [];
  let labels: ChartData["labels"] = {};

  // Handling horizontal bar charts differently (aggregate on x-axis)
  if (type === "barX") {
    if (x && x.length > 0 && aggregate !== false) {
      aggregateSelection = ` ${agg}(x::FLOAT) as x`;
      labels.x = `${toTitleCase(agg)} of ${toTitleCase(x)}`;
    }
    groupBy = columns.filter((d) => d !== "x");
  } else {
    if (y && y.length > 0 && aggregate !== false) {
      // First aggregation (mean, sum, etc.)
      aggregateSelection = ` ${agg}(y::FLOAT) as y`;
      labels.y = `${toTitleCase(agg)} of ${toTitleCase(y)}`;
    }
    groupBy = columns.filter((d) => d !== "y");
  }

  const orderBy = getOrder(groupBy, type, x, y); // Generates valid `ORDER BY` for outer query

  if (aggregate !== false) {
    description.value += `The ${
      type === "barX" ? "x" : "y"
    } values were aggregated with a ${agg} aggregation, grouped by ${groupBy.join(
      `, `
    )}.`;
  }
  // First, we aggregate the values (sum, mean, etc.) if needed
  const subquery =
    aggregate !== false
      ? `
    SELECT ${groupBy.join(", ")}, ${aggregateSelection}
    FROM ${tableName}
    GROUP BY ${groupBy.join(", ")}`
      : `SELECT * FROM ${tableName}`;

  // Then, calculate the percentage over the aggregated values if needed
  let aggregateColumn = "";
  if (type === "barX") {
    aggregateColumn = percent
      ? ` (x / (SUM(x) OVER (PARTITION BY ${groupBy
          .filter((d) => d !== "series")
          .join(", ")}))) * 100 as x`
      : "x";
  } else {
    aggregateColumn = percent
      ? ` (y / (SUM(y) OVER (PARTITION BY ${groupBy
          .filter((d) => d !== "series")
          .join(", ")}))) * 100 as y`
      : "y";
  }

  if (percent) {
    description.value += ` The ${
      type === "barX" ? "x" : "y"
    } values were calculated as a percentage of the total for each group.`;
  }

  // Use the subquery to aggregate the values
  return {
    queryString: `
      WITH aggregated AS (${subquery})
      SELECT ${groupBy.join(", ")}, ${aggregateColumn}
      FROM aggregated
      ${orderBy ? ` ORDER BY ${orderBy}` : ""}
    `,
    labels,
  };
}

// If an explicit order has been added (e.g., if multiple y values are passed
// in) we should respect their input order. This includes the case that there
// are multiple y values AND a series encoding. In the transform above the y
// column names are concatenated with the series values, so the like statement
// below maintains the order of the y groups.
export function getOrder(
  groupBy: string[],
  type: ChartType,
  x: string[],
  y: string[]
) {
  let orderBy;
  if ((type === "barX" && x.length > 1) || (type !== "barX" && y.length > 1)) {
    const orderByArray = type === "barX" && x.length > 1 ? x : y; // columns to order
    // This is a handling for the use of fx to create a grouped bar chart. Feels
    // a bit fragile
    const exclude =
      type === "barY" && groupBy.includes("fx") ? ["series", "x"] : ["series"];
    orderBy = [...groupBy].filter((d) => !exclude.includes(d)).join(", "); // Remove series from the ordering
    let caseStatements = orderByArray
      .map((item, index) => `WHEN series like '${item}%' THEN ${index + 1}`)
      .join("\n");

    orderBy += `, CASE 
    ${caseStatements}
    ELSE ${orderByArray.length + 1} 
END;`;
  } else {
    orderBy = "";
  }
  return orderBy;
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
