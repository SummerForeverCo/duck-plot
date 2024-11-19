import { AsyncDuckDB } from "@duckdb/duckdb-wasm";
import {
  Aggregate,
  ChartData,
  ChartType,
  ColumnConfig,
  ColumnType,
  DescribeSchema,
  Indexable,
  QueryMap,
} from "./types";
import {
  columnIsDefined,
  getAggregateInfo,
  getLabel,
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
import type { DuckPlot } from ".";
import { isColor } from "./getPlotOptions";

export function getUniqueName() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Query the local duckdb database and format the result based on the settings
export async function prepareChartData(
  instance: DuckPlot
): Promise<{ data: ChartData; description: string; queries?: QueryMap }> {
  let queries: QueryMap = {};
  if (!instance.ddb || !instance.table())
    return { data: [], description: "No database or table provided" };
  let description = {
    value: "",
  };

  let queryString: string;
  let labels: ChartData["labels"] = {};
  let preQueryTableName = "";
  const reshapeTableName = getUniqueName();

  // Identify the columns present in the config:
  const columns = Object.fromEntries(
    [
      ["x", instance.x().column],
      ["y", instance.y().column],
      [
        "series",
        !isColor(instance.color().column) ? instance.color().column : false,
      ],
      ["fy", instance.fy().column],
      ["fx", instance.fx().column],
      ["r", instance.r().column],
      ["text", instance.text().column],
    ].filter(([key, value]) => value) // Remove `false` or `undefined` entries
  );

  // If someone wants to run some arbitary sql first, store that in a temp table
  const preQuery = instance.query();
  if (preQuery) {
    preQueryTableName = getUniqueName();
    const createStatement = `CREATE TABLE ${preQueryTableName} as ${preQuery}`;
    description.value += `The provided sql query was run.\n`;
    queries["preQuery"] = createStatement;
    await runQuery(instance.ddb, createStatement);
  }
  let transformTableFrom = preQuery ? preQueryTableName : instance.table();

  // Make sure that the columns are in the schema
  const initialSchema = await runQuery(
    instance.ddb,
    `DESCRIBE ${transformTableFrom}`
  );
  const allColumns = Object.entries(columns).flatMap(([key, col]) => col);
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
    instance.mark().markType,
    columns,
    transformTableFrom,
    reshapeTableName,
    description
  );
  queries["transform"] = tranformQuery;
  await runQuery(instance.ddb, tranformQuery);

  // Detect if the values are distincy across the other columns, for example if
  // the y values are distinct by x, series, and facets for a barY chart. Note,
  // the `r` and `label` columns are not considered for distinct-ness but are
  // passed through for usage
  let distinctCols = (
    instance.mark().markType === "barX"
      ? ["y", "series", "fy", "fx"]
      : ["x", "series", "fy", "fx"]
  ).filter((d) => columnIsDefined(d as keyof ColumnConfig, columns));

  // Catch for reshaped data where series gets added
  const yValue = Array.isArray(columns.y)
    ? columns.y.filter((d: any) => d)
    : [columns.y];
  if (yValue.length > 1 && !distinctCols.includes("series")) {
    distinctCols.push("series");
  }
  // Deteremine if we should aggregate

  const isDistinct = await checkDistinct(
    instance.ddb,
    reshapeTableName,
    distinctCols
  );
  const allowsAggregation =
    allowAggregation(instance.mark().markType) || instance.config().aggregate;

  // If there are no distinct columns (e.g., y axis is selected without x axis), we can't aggregate
  const shouldAggregate =
    !isDistinct &&
    allowsAggregation &&
    (distinctCols.includes("y") ||
      distinctCols.includes("x") ||
      distinctCols.includes("fx") ||
      instance.config().aggregate);
  // TODO: do we need the distincCols includes check here...?
  const transformedTypes = await columnTypes(instance.ddb, reshapeTableName);
  // TODO: more clear arguments in here
  const { labels: aggregateLabels, queryString: aggregateQuery } =
    getAggregateInfo(
      instance.mark().markType,
      columns,
      [...transformedTypes.keys()],
      reshapeTableName,
      !shouldAggregate ? false : instance.config().aggregate,
      description,
      instance.config().percent
    );
  queryString = aggregateQuery;
  labels = aggregateLabels;
  let data;
  let schema: DescribeSchema;
  queries["final"] = queryString;
  data = await runQuery(instance.ddb, queryString);
  schema = await runQuery(instance.ddb, `DESCRIBE ${reshapeTableName}`);
  // Format data as an array of objects
  let formatted: ChartData = formatResults(data, schema);

  if (!labels!.series) {
    labels!.series = getLabel(columns.series);
  }
  if (!labels!.x) {
    // Use the fx label for grouped bar charts
    labels!.x = getLabel(columns.fx ?? columns.x);
  }
  if (!labels!.y) {
    labels!.y = getLabel(columns.y);
  }
  formatted.labels = labels;
  // Drop the reshaped table
  await runQuery(instance.ddb, `drop table if exists "${reshapeTableName}"`);
  if (preQueryTableName)
    await runQuery(instance.ddb, `drop table if exists "${preQueryTableName}"`);
  return {
    data: formatted,
    description:
      description.value || "No transformations or aggregations applied.",
    queries,
  };
}
