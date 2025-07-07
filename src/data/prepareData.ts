import {
  Data,
  ColumnConfig,
  DescribeSchema,
  Indexable,
  QueryMap,
} from "../types";
import {
  columnIsDefined,
  getFinalQuery,
  getLabel,
  getTransformQuery,
} from "./query";
import { runQuery } from "./runQuery";
import {
  allowAggregation,
  formatResults,
  checkDistinct,
  columnTypes,
} from "../helpers";
import type { DuckPlot } from "..";
import { isColor } from "../options/getPlotOptions";

export function getUniqueName() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Query the local duckdb database and format the result based on the settings
export async function prepareData(
  instance: DuckPlot
): Promise<{ data: Data; description: string; queries?: QueryMap }> {
  let queries: QueryMap = {};
  if (!instance.ddb || !instance.table())
    return { data: [], description: "No database or table provided" };
  let description = {
    value: "",
  };

  let queryString: string;
  let labels: Data["labels"] = {};
  let preQueryTableName = "";
  const catalogPrefix = instance.catalog() ? `${instance.catalog()}.` : "";
  const reshapeTableName = `${catalogPrefix}${getUniqueName()}`;
  const type = instance.mark().type;

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
    preQueryTableName = `${catalogPrefix}${getUniqueName()}`;
    const createStatement = `CREATE TABLE ${preQueryTableName} as ${preQuery}`;
    description.value += `The provided sql query was run.\n`;
    queries["preQuery"] = createStatement;
    await runQuery(instance.ddb, createStatement);
  }
  let transformTableFrom = preQuery
    ? preQueryTableName
    : `${catalogPrefix}${instance.table()}`;

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
    type,
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
    type === "barX" || type === "rectX"
      ? ["y", "series", "fy", "fx", "text"]
      : ["x", "series", "fy", "fx", "text"]
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
    allowAggregation(type) || instance.config().aggregate;

  // If there are no distinct columns (e.g., y axis is selected without x axis), we can't aggregate
  const shouldAggregate =
    !isDistinct &&
    allowsAggregation &&
    (distinctCols.includes("y") ||
      distinctCols.includes("x") ||
      distinctCols.includes("fx") ||
      ((type === "treemap" || type === "circlePack" || type === "pie") &&
        (distinctCols.includes("series") || distinctCols.includes("text"))) ||
      instance.config().aggregate);

  // TODO: do we need the distincCols includes check here...?
  const transformedTypes = await columnTypes(instance.ddb, reshapeTableName);

  // TODO: more clear arguments in here
  const { labels: aggregateLabels, queryString: finalQuery } = getFinalQuery(
    instance,
    columns,
    [...transformedTypes.keys()],
    reshapeTableName,
    !shouldAggregate ? false : instance.config().aggregate,
    description
  );
  queryString = finalQuery;

  labels = aggregateLabels;
  let data;
  let schema: DescribeSchema;
  queries["final"] = queryString;
  // This query will *generate* the final table, which we then need to
  // separately select from
  await runQuery(instance.ddb, queryString);
  const chartTableName = `${catalogPrefix}chart_${instance.id()}`;
  data = await runQuery(instance.ddb, `SELECT * FROM ${chartTableName}`);
  schema = await runQuery(instance.ddb, `DESCRIBE ${chartTableName}`);
  // Format data as an array of objects
  let formatted: Data = formatResults(data, schema);

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
