import * as Plot from "@observablehq/plot";
import { JSDOM } from "jsdom";
import type { PlotOptions } from "@observablehq/plot";

import {
  ChartData,
  ChartType,
  Config,
  MarkProperty,
  PlotProperty,
} from "./types";
import { prepareChartData } from "./prepareChartData";
import {
  getCommonMarks,
  getfyMarks,
  getLegendType,
  getMarkOptions,
  getSorts,
  getTopLevelPlotOptions,
  isColor,
} from "./getPlotOptions";
import { PlotFit } from "./plotFit";
import { legendCategorical } from "./legendCategorical";
import "./legend.css";
import { legendContinuous } from "./legendContinuous";
import { AsyncDuckDB } from "@duckdb/duckdb-wasm";
import equal from "fast-deep-equal";
const emptyProp = { column: "", options: {} };
export class DuckPlot {
  private _ddb: AsyncDuckDB | null = null;
  private _table: string | null = null;
  private _x: PlotProperty<"x"> = { ...emptyProp };
  private _y: PlotProperty<"y"> = { ...emptyProp };
  private _fy: PlotProperty<"fy"> = { ...emptyProp };
  private _fx: PlotProperty<"fx"> = { ...emptyProp };
  private _color: PlotProperty<"color"> = { ...emptyProp };
  private _mark: MarkProperty = {
    markType: "line",
    options: {},
  };
  private _options: PlotOptions = {};
  private _jsdom: JSDOM | undefined;
  private _font: any;
  private _isServer: boolean;
  private _document: Document;
  private _newDataProps: boolean = true;
  private _chartData: ChartData = [];
  private _config: Config = {};
  private _query: string = "";

  constructor(
    ddb: AsyncDuckDB,
    { jsdom, font }: { jsdom?: JSDOM; font?: any } = {}
  ) {
    this._ddb = ddb;
    this._jsdom = jsdom;
    this._font = font;
    this._isServer = jsdom !== undefined;
    this._document = this._isServer
      ? this._jsdom!.window.document
      : window.document;
  }

  table(): string;
  table(table: string): this;
  table(table?: string): string | this {
    if (table) {
      if (table !== this._table) {
        this._table = table;
        this._newDataProps = true; // when changed, we need to requery the data
      }
      return this;
    }
    return this._table!;
  }

  // Method to run arbitrary sql BEFORE transforming the data
  query(): string;
  query(query: string): this;
  query(query?: string): string | this {
    if (query) {
      if (query !== this._query) {
        this._query = query;
        this._newDataProps = true; // when changed, we need to requery the data
      }
      return this;
    }
    return this._query;
  }
  // Helper method for getting and setting x, y, color, and fy properties
  private handleProperty<T extends keyof PlotOptions>(
    prop: PlotProperty<T>,
    column?: string | false | null,
    options?: PlotOptions[T]
  ): PlotProperty<T> | this {
    if (column !== undefined && !equal(column, prop.column)) {
      this._newDataProps = true; // When changed, we need to requery the data
    }
    if (column === false || column === null) {
      prop.column = "";
      if (options !== undefined) prop.options = options;
    } else {
      if (column !== undefined) prop.column = column;
      if (options !== undefined) prop.options = options;
    }
    return column === undefined ? prop : this;
  }

  // x method using the generic handler
  x(): PlotProperty<"x">;
  x(column: string, options?: PlotOptions["x"]): this;
  x(column?: string, options?: PlotOptions["x"]): PlotProperty<"x"> | this {
    return this.handleProperty(this._x, column, options);
  }

  // y method using the generic handler
  y(): PlotProperty<"y">;
  y(column: string, options?: PlotOptions["y"]): this;
  y(column?: string, options?: PlotOptions["y"]): PlotProperty<"y"> | this {
    return this.handleProperty(this._y, column, options);
  }

  // color method using the generic handler
  color(): PlotProperty<"color">;
  color(column: string, options?: PlotOptions["color"]): this;
  color(
    column?: string,
    options?: PlotOptions["color"]
  ): PlotProperty<"color"> | this {
    return this.handleProperty(this._color, column, options);
  }

  // fy method using the generic handler
  // TODO: maybe remove the plotOptions here
  fy(): PlotProperty<"fy">;
  fy(column: string, options?: PlotOptions["fy"]): this;
  fy(column?: string, options?: PlotOptions["fy"]): PlotProperty<"fy"> | this {
    return this.handleProperty(this._fy, column, options);
  }

  // fy method using the generic handler
  // TODO: maybe remove the plotOptions here
  fx(): PlotProperty<"fx">;
  fx(column: string, options?: PlotOptions["fx"]): this;
  fx(column?: string, options?: PlotOptions["fx"]): PlotProperty<"fx"> | this {
    return this.handleProperty(this._fx, column, options);
  }

  mark(): MarkProperty;
  mark(markType: ChartType, options?: MarkProperty["options"]): this;
  mark(
    markType?: ChartType,
    options?: MarkProperty["options"]
  ): MarkProperty | this {
    if (markType) {
      if (this._mark.markType !== markType) {
        this._newDataProps = true; // when changed, we need to requery the data
      }
      this._mark = { markType, ...(options ? { options } : {}) };
      return this;
    }
    return this._mark!;
  }

  options(): PlotOptions;
  options(opts: PlotOptions): this;
  options(opts?: PlotOptions): PlotOptions | this {
    if (opts) {
      // TODO: this is probably an unnecessary check
      if (!equal(opts, this._options)) {
        this._options = opts;
      }
      return this;
    }
    return this._options!;
  }

  config(): Config;
  config(config: Config): this;
  config(config?: Config): Config | this {
    if (config) {
      this._config = config;
      return this;
    }
    return this._config;
  }

  data(): ChartData {
    return this._chartData || [];
  }

  // TODO; private?
  async prepareChartData(): Promise<ChartData> {
    if (!this._ddb || !this._table)
      throw new Error("Database and table not set");
    // TODO: this error isn't being thrown when I'd expect (e.g, if type is not set)
    if (!this._mark) throw new Error("Type not set");
    this._newDataProps = false;
    const columns = {
      ...(this._x.column ? { x: this._x.column } : {}),
      ...(this._y.column ? { y: this._y.column } : {}),
      ...(this._color.column && !isColor(this._color.column)
        ? { series: this._color.column }
        : {}), // TODO: naming....?
      ...(this._fy.column ? { fy: this._fy.column } : {}),
      ...(this._fx.column ? { fx: this._fx.column } : {}),
    };
    return prepareChartData(
      this._ddb,
      this._table,
      columns,
      this._mark.markType!,
      this._query
    );
  }

  async render(): Promise<SVGElement | HTMLElement | null> {
    if (!this._mark) return null;
    // Because users can specify options either in .options or with each column, we coalese them here
    let plotOptions = {
      ...this._options,
      x: {
        ...this._options.x,
        ...this._x.options,
      },
      y: {
        ...this._options.y,
        ...this._y.options,
      },
      color: {
        ...this._options.color,
        ...this._color.options,
      },
      // TODO: figure out how we want to handle fx and fy (and their options).
      // Probably not allow them to be passed in.
      fy: {
        ...this._options.fy,
        ...this._fy.options,
      },
    };
    const chartData = this._newDataProps
      ? await this.prepareChartData()
      : this._chartData;

    // Fallback to computed labels if they are undefined
    if (plotOptions.x.label === undefined)
      plotOptions.x.label = chartData.labels?.x;
    if (plotOptions.y.label === undefined)
      plotOptions.y.label = chartData.labels?.y;
    if (plotOptions.color.label === undefined)
      plotOptions.color.label = chartData.labels?.series;

    this._chartData = chartData;
    const document = this._isServer ? this._jsdom!.window.document : undefined;
    const currentColumns = chartData?.types ? Object.keys(chartData.types) : []; // TODO: remove this arg from topLevelPlotOptions
    // TODO: custom sorts as inputs
    const sorts = getSorts(currentColumns, chartData);

    // Note, displaying legends by default
    const legendDisplay = plotOptions.color.legend ?? true;
    const hasLegend = chartData.types?.series !== undefined && legendDisplay;
    const legendType =
      plotOptions?.color.type ?? getLegendType(chartData, currentColumns);
    // TODO: maybe rename series to color....?
    const legendLabel = plotOptions.color.label;

    // Different legend height for continuous, leave space for categorical label
    const legendHeight =
      legendType === "continuous" ? 50 : legendLabel ? 44 : 28;
    plotOptions.height = hasLegend
      ? (plotOptions.height || 281) - legendHeight
      : plotOptions.height || 281;

    const primaryMarkOptions = getMarkOptions(
      currentColumns,
      this._mark.markType,
      {
        color: isColor(this._color.column) ? this._color.column : undefined,
        r: this._config.r,
        tip: this._isServer ? false : this._config?.tip, // don't allow tip on the server
        xLabel: plotOptions.x.label ?? "",
        yLabel: plotOptions.y.label ?? "",
        markOptions: this._mark.options,
      }
    );

    const topLevelPlotOptions = getTopLevelPlotOptions(
      chartData,
      currentColumns,
      sorts,
      this._mark.markType,
      plotOptions,
      this._config
    );

    const primaryMark =
      !currentColumns.includes("x") || !currentColumns.includes("y")
        ? []
        : [Plot[this._mark.markType](chartData, primaryMarkOptions)];
    // TODO: double check you don't actually use border color
    // If a user supplies marks, don't add the common marks
    const commonPlotMarks =
      this._options.marks ?? getCommonMarks(currentColumns);
    const fyMarks = getfyMarks(chartData, currentColumns);
    const options = {
      ...topLevelPlotOptions,
      marks: [...fyMarks, ...commonPlotMarks, ...primaryMark],
      ...(document ? { document } : {}),
    };

    // Adjust margins UNLESS specified otherwise AND not on the server without a
    // font
    const serverWithoutFont = this._isServer && !this._font;
    const autoMargin = serverWithoutFont
      ? false
      : this._config.autoMargin !== false;

    const plt = autoMargin
      ? PlotFit(options, {}, this._font)
      : Plot.plot(options);

    plt.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const wrapper = this._document.createElement("div");
    if (hasLegend) {
      let legend: HTMLDivElement;
      const div = this._document.createElement("div");

      if (legendType === "categorical") {
        // TODO: better argument order
        legend = legendCategorical(
          this._document,
          Array.from(plt.scale("color")?.domain ?? []),
          Array.from(plt.scale("color")?.range ?? []),
          plotOptions?.width || 500, // TODO: default width
          plotOptions.height,
          legendLabel ?? "",
          this._font
        );
      } else {
        legend = legendContinuous({
          color: { ...plt.scale("color") },
          label: legendLabel,
          ...(document ? { document } : {}),
        });
      }
      div.appendChild(legend);
      wrapper?.appendChild(div);
    }
    wrapper.appendChild(plt);
    return wrapper;
  }
}
