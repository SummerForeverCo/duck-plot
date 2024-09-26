import { AsyncDuckDB } from "@duckdb/duckdb-wasm";
import {
  Aggregate,
  ChartData,
  ChartType,
  ColumnConfig,
  DescribeSchema,
  Indexable,
  QueryMap,
} from "./types";
import {
  columnIsDefined,
  getAggregateInfo,
  getTransformQuery,
  toTitleCase,
} from "./query";
import { runQuery } from "./runQuery";
import {
  allowAggregation,
  formatResults,
  checkDistinct,
  columnTypes,
} from "./helpers";
import { Database } from "duckdb-async";

export function getUniqueName() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Query the local duckdb database and format the result based on the settings
export async function prepareChartData(
  ddb: AsyncDuckDB | Database,
  tableName: string | undefined,
  config: ColumnConfig,
  type: ChartType,
  preQuery?: string,
  aggregate?: Aggregate
): Promise<{ data: ChartData; description: string; queries?: QueryMap }> {
  let queries: QueryMap = {};
  if (!ddb || !tableName)
    return { data: [], description: "No database or table provided" };
  let description = {
    value: "",
  };

  let queryString: string;
  let labels: ChartData["labels"] = {};
  let preQueryTableName = "";
  const reshapeTableName = getUniqueName();

  // If someone wants to run some arbitary sql first, store that in a temp table
  if (preQuery) {
    preQueryTableName = getUniqueName();
    const createStatement = `CREATE TABLE ${preQueryTableName} as ${preQuery}`;
    description.value += `The provided sql query was run.\n`;
    queries["preQuery"] = createStatement;
    await runQuery(ddb, createStatement);
  }
  let transformTableFrom = preQuery ? preQueryTableName : tableName;

  // Make sure that the columns are in the schema
  const initialSchema = await runQuery(ddb, `DESCRIBE ${transformTableFrom}`);
  const allColumns = Object.entries(config).flatMap(([key, col]) => col);
  const schemaCols = initialSchema.map((row: Indexable) => row.column_name);

  // Find the missing columns
  const missingColumns = allColumns.filter((col) => !schemaCols.includes(col));

  if (missingColumns.length > 0) {
    throw new Error(
      `Column(s) not found in schema: ${missingColumns.join(", ")}`
    );
  }
  // First, reshape the data if necessary: this will create a NEW DUCKDB TABLE
  // that has generic column names (e.g., `x`, `y`, `series`, etc.)
  const tranformQuery = getTransformQuery(
    type,
    config,
    transformTableFrom,
    reshapeTableName,
    description
  );
  queries["transform"] = tranformQuery;
  await runQuery(ddb, tranformQuery);

  // Detect if the values are distincy across the other columns, for example if
  // the y values are distinct by x, series, and facets for a barY chart. Note,
  // the `r` and `label` columns are not considered for distinct-ness but are
  // passed through for usage
  let distinctCols = (
    type === "barX" ? ["y", "series", "fy", "fx"] : ["x", "series", "fy", "fx"]
  ).filter((d) => columnIsDefined(d as keyof ColumnConfig, config));

  // Catch for reshaped data where series gets added
  const yValue = Array.isArray(config.y)
    ? config.y.filter((d) => d)
    : [config.y];
  if (yValue.length > 1 && !distinctCols.includes("series")) {
    distinctCols.push("series");
  }
  // Deteremine if we should aggregate

  const isDistinct = await checkDistinct(ddb, reshapeTableName, distinctCols);
  const allowsAggregation = allowAggregation(type) || aggregate;

  // If there are no distinct columns (e.g., y axis is selected without x axis), we can't aggregate
  const shouldAggregate =
    !isDistinct &&
    allowsAggregation &&
    (distinctCols.includes("y") ||
      distinctCols.includes("x") ||
      distinctCols.includes("fx") ||
      aggregate);
  // TODO: do we need the distincCols includes check here...?
  if (!shouldAggregate) {
    queryString = `SELECT * FROM ${reshapeTableName}`;
  } else {
    const transformedTypes = await columnTypes(ddb, reshapeTableName);
    const { labels: aggregateLabels, queryString: aggregateQuery } =
      getAggregateInfo(
        type,
        config,
        [...transformedTypes.keys()],
        reshapeTableName,
        aggregate,
        description
      );
    queryString = aggregateQuery;
    labels = aggregateLabels;
  }
  let data;
  let schema: DescribeSchema;
  queries["final"] = queryString;
  data = await runQuery(ddb, queryString);
  schema = await runQuery(ddb, `DESCRIBE ${reshapeTableName}`);
  // Format data as an array of objects
  let formatted: ChartData = formatResults(data, schema);

  if (!labels!.series) {
    labels!.series = toTitleCase(
      Array.isArray(config.series)
        ? config.series?.filter((d) => d)?.join(", ")
        : config.series
    );
  }
  if (!labels!.x) {
    labels!.x = config.fx ? toTitleCase(config.fx) : toTitleCase(config.x);
  }
  if (!labels!.y) {
    labels!.y = toTitleCase(
      Array.isArray(config.y)
        ? config.y?.filter((d) => d)?.join(", ")
        : config.y
    );
  }
  formatted.labels = labels;
  // Drop the reshaped table
  await runQuery(ddb, `drop table if exists "${reshapeTableName}"`);
  if (preQueryTableName)
    await runQuery(ddb, `drop table if exists "${preQueryTableName}"`);
  return {
    data: formatted,
    description:
      description.value || "No transformations or aggregations applied.",
    queries,
  };
}
