import { AsyncDuckDB } from "@duckdb/duckdb-wasm";
import { ChartData, ChartType, Config, DescribeSchema } from "./types";
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
  config: Config,
  type: ChartType
): Promise<ChartData> {
  // Note, this function depends on the component props
  if (!ddb || !tableName) return [];

  let queryString: string;
  let labels: ChartData["labels"] = {};
  const reshapeTableName = getUniqueName();

  // First, reshape the data if necessary: this will create a NEW DUCKDB TABLE
  // that ALWAYS has the columns `x`, `y`, and `series`.
  const tranformQuery = getTransformQuery(
    type,
    config,
    tableName,
    reshapeTableName
  );
  await runQuery(ddb, tranformQuery);

  let distinctCols = (
    type === "barX" ? ["y", "series", "facet"] : ["x", "series", "facet"]
  ).filter((d) => columnIsDefined(d as keyof Config, config));

  // Catch for reshaped data where series gets added
  const yValue = Array.isArray(config.y)
    ? config.y.filter((d) => d)
    : [config.y];
  if (yValue.length > 1 && !distinctCols.includes("series")) {
    // Added as fx for groupedY
    const col = type === "barYGrouped" ? "fx" : "series";
    distinctCols.push(col);
  }
  // Deteremine if we should aggregate

  const isDistinct = await checkDistinct(ddb, reshapeTableName, distinctCols);
  const allowsAggregation = allowAggregation(type);

  // If there are no distinct columns (e.g., y axis is selected before x axis), we can't aggregate
  const shouldAggregate =
    !isDistinct &&
    allowsAggregation &&
    (distinctCols.includes("y") || distinctCols.includes("x"));
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
        reshapeTableName
      );
    queryString = aggregateQuery;
    labels = aggregateLabels;
  }
  let data;
  let schema: DescribeSchema;
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
    labels!.x = toTitleCase(config.x);
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
  return formatted;
}
