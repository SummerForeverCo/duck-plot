import type { AsyncDuckDB } from "@duckdb/duckdb-wasm";

export type ChartType =
  | "dot"
  | "areaY"
  | "line"
  | "barX"
  | "barY"
  | "barYGrouped";

export type SqlSort = {
  column: string;
  direction: SortOperators;
};
export enum SortOperators {
  asc = "asc",
  desc = "desc",
}
export type SqlQueryOptions = {
  select?: string[];
  aggregateSelection?: string;
  from?: string;
  where?: SqlWhere;
  orderBy?: string | string[];
  limit?: number;
  sort?: SqlSort[];
  groupBy?: string[];
  into?: string; // for inserting a new table!
  // Add more options as needed
};
export const whereOperators = ["=", "!=", "<", ">", "<=", ">="] as const;

export type SqlWhere = {
  [key: string]: {
    value: string | number;
    operator: (typeof whereOperators)[number] | "LIKE";
  };
};

export type Indexable = {
  [key: string]: any;
};
export type Column = "x" | "y" | "series" | "facet";
export type Config = Partial<Record<Column, string>>;
export interface ChartData extends Array<Indexable> {
  types?: { [key: string]: BasicColumnType };
  labels?: { x?: string; y?: string; series?: string };
}
export type BasicColumnType = "string" | "number" | "date" | undefined;

export interface ColumnSchema {
  column_name: string;
  column_type: string;
}

// Return value from DESCRIBE
export type DescribeSchema = ColumnSchema[];

export interface TypesObject {
  [key: string]: BasicColumnType;
}

export interface DataConfig {
  ddb: AsyncDuckDB;
  table: string;
}

export interface ColumnsConfig {
  x: string;
  y: string;
  series: string;
  facet?: string;
}

export interface PlotConfig {
  xLabel?: string;
  yLabel?: string;
  legendLabel?: string;
  width?: number;
  height?: number;
  xLabelDisplay?: boolean;
  yLabelDisplay?: boolean;
  legendDisplay?: boolean;
  hideTicks: boolean;
  color?: string;
  r?: number;
  // TODO: support these?
  // title?: string;
  // titleDisplay?: boolean;
}
