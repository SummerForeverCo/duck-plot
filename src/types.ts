import type {
  BinOptions,
  MarkOptions,
  PlotOptions,
  RenderFunction,
  StackOptions,
} from "@observablehq/plot";
import { DuckPlot } from ".";

// TODO: all plot chart types?
export type ChartType =
  | "dot"
  | "areaY"
  | "line"
  | "barX"
  | "barY"
  | "text"
  | "tickX"
  | "tickY"
  | "rectX"
  | "rectY"
  | "treemap"
  | "circlePack"
  | "image"
  | "pie"
  | undefined;

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
export type Column = "x" | "y" | "series" | "fy" | "fx" | "r" | "text";
export type ColumnConfig = Partial<Record<Column, ColumnType>>;
export interface Data extends Array<Indexable> {
  types?: { [key: string]: BasicColumnType };
  labels?: { x?: string; y?: string; series?: string };
}
export interface PieData {
  y: number;
  series: string;
}
export type BasicColumnType = "string" | "number" | "date" | undefined;
// TODO: maybe rename this...?
export type ColumnType = string | string[];
export type IncomingColumType = ColumnType | false | null;
export interface ColumnSchema {
  column_name: string;
  column_type: string;
}

// Return value from DESCRIBE
export type DescribeSchema = ColumnSchema[];

export interface TypesObject {
  [key: string]: BasicColumnType;
}

// Define a generic type for property
export type PlotProperty<T extends keyof PlotOptions> = {
  column: ColumnType;
  options?: PlotOptions[T];
};

// Extend the MarkOptions to include all the stack and bin options
export interface AllMarkOptions extends MarkOptions, StackOptions, BinOptions {}

export type MarkProperty = {
  type?: ChartType;
  options?: AllMarkOptions;
};

// Remove `undefined` from the chart type keys for type below
type DefinedChartType = Exclude<ChartType, undefined>;

// The options are key-value pairs so they're specific to each mark type
export type MarkColumnProperty = {
  column?: string;
  options?: Partial<Record<DefinedChartType, AllMarkOptions>>;
};

// A few types that we can't quite squeeze into (or out of) PlotOptions. The
// label display options are important because the labels specifcy the labels
// in the tooltips (but someone might want to turn off the labels in the plot)
export type Config = {
  xLabelDisplay?: boolean;
  yLabelDisplay?: boolean;
  tip?: boolean; // Show tooltips
  // For use in the tooltip
  tipLabels?: {
    x?: string;
    y?: string;
    color?: string;
  };
  tipValues?: {
    x?: (d: Indexable, i: number) => string;
    y?: (d: Indexable, i: number) => string;
    color?: (d: Indexable, i: number) => string;
  };
  tipMark?: {
    type: Exclude<ChartType, "circlePack" | "treemap" | "pie">;
    options: MarkOptions;
  };
  // For pie chart section labels
  displayPiePerentages?: boolean;
  donut?: boolean; // For pie charts
  autoMargin?: boolean; // Automatically adjust margins
  aggregate?: Aggregate;
  interactiveLegend?: boolean;
  percent?: boolean; // for percent stacked charts, TODO document clearly
  onClick?: (event: Event, value: unknown) => void;
  customRender?: RenderFunction;
};

export type Aggregate =
  | "sum"
  | "avg"
  | "count"
  | "max"
  | "min"
  | "median"
  | "mode"
  | "stddev"
  | "variance"
  | false; // no aggregation

export type QueryMap = {
  [key: string]: string;
};
export type DuckPlotInstance = DuckPlot;

export type Sorts = {
  x?: { domain: string[] };
  y?: { domain: string[] };
  fx?: { domain: string[] };
  fy?: { domain: string[] };
  series?: { domain: string[] }; // TODO, color?
};

export type ArcOptions = {
  startAngle: (d: { startAngle: number }) => number;
  endAngle: (d: { endAngle: number }) => number;
  innerRadius: number;
  outerRadius: number;
  x: (d: { x: number }) => number;
  y: (d: { yPos: number }) => number;
  fill: (d: PieData) => string;
  instance: DuckPlot;
};
