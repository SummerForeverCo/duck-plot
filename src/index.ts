import * as Plot from "@observablehq/plot";
import { JSDOM } from "jsdom";
import type { PlotOptions } from "@observablehq/plot";

import { ChartData, ChartType, Config, PlotProperty } from "./types";
import { prepareChartData } from "./prepareChartData";
import {
  getCommonMarks,
  getFacetMarks,
  getLegendType,
  getMarkOptions,
  getPlotMarkType,
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

export class DuckPlot {
  private _ddb: AsyncDuckDB | null = null;
  private _table: string | null = null;
  private _x: PlotProperty<"x"> = {
    column: "",
    options: {},
  };

  private _y: PlotProperty<"y"> = {
    column: "",
    options: {},
  };

  private _facet: PlotProperty<"facet"> = {
    column: "",
    options: {},
  };

  private _color: PlotProperty<"color"> = {
    column: "",
    options: {},
  };
  private _type: ChartType | null = null;
  private _options: PlotOptions = {};
  private _jsdom: JSDOM | undefined;
  private _font: any;
  private _isServer: boolean;
  private _document: Document;
  private _newDataProps: boolean = true;
  private _chartData: ChartData = [];
  private _config: Config = {};

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

  // Helper method for getting and setting x, y, color, and facet properties
  private handleProperty<T extends keyof PlotOptions>(
    prop: PlotProperty<T>,
    column?: string,
    options?: PlotOptions[T]
  ): PlotProperty<T> | this {
    if (!column) {
      return prop;
    }
    if (column !== prop.column) {
      this._newDataProps = true; // When changed, we need to requery the data
    }
    prop.column = column;
    prop.options = options;
    return this;
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

  // facet method using the generic handler
  facet(): PlotProperty<"facet">;
  facet(column: string, options?: PlotOptions["facet"]): this;
  facet(
    column?: string,
    options?: PlotOptions["facet"]
  ): PlotProperty<"facet"> | this {
    return this.handleProperty(this._facet, column, options);
  }

  type(): ChartType;
  type(value: ChartType): this;
  type(value?: ChartType): ChartType | this {
    if (value) {
      if (this._type !== value) {
        this._type = value;
        this._newDataProps = true; // when changed, we need to requery the data
      }
      return this;
    }
    return this._type!;
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
    if (!this._type) throw new Error("Type not set");
    this._newDataProps = false;
    const columns = {
      ...(this._x.column ? { x: this._x.column } : {}),
      ...(this._y.column ? { y: this._y.column } : {}),
      ...(this._color.column && !isColor(this._color.column)
        ? { series: this._color.column }
        : {}), // TODO: naming....?
      ...(this._facet.column ? { facet: this._facet.column } : {}),
    };
    return prepareChartData(this._ddb, this._table, columns, this._type!);
  }

  async render(): Promise<SVGElement | HTMLElement | null> {
    if (!this._type) return null;
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
      facet: {
        ...this._options.facet,
        ...this._facet.options,
      },
    };
    const chartData = this._newDataProps
      ? await this.prepareChartData()
      : this._chartData;

    // Fallback to computed labels if they aren't present in the options
    plotOptions.x.label = plotOptions.x.label ?? chartData.labels?.x;
    plotOptions.y.label = plotOptions.y.label ?? chartData.labels?.y;
    plotOptions.color.label =
      plotOptions.color.label ?? chartData.labels?.series;

    this._chartData = chartData;
    const document = this._isServer ? this._jsdom!.window.document : undefined;
    const currentColumns = chartData?.types ? Object.keys(chartData.types) : []; // TODO: remove this arg from topLevelPlotOptions
    // TODO: custom sorts as inputs
    const sorts = getSorts(currentColumns, chartData);
    const plotMarkType = getPlotMarkType(this._type);

    // Note, displaying legends by default
    const legendDisplay = plotOptions.color.legend ?? true;
    // TODO: get from options
    const hasLegend = chartData.types?.series !== undefined && legendDisplay;
    // TODO: accept input legend type
    const legendType =
      plotOptions?.color.type ?? getLegendType(chartData, currentColumns);
    // TODO: maybe rename series to color....?
    const legendLabel = plotOptions.color.label;

    // Different legend height for continuous, leave space for categorical label
    const legendHeight =
      legendType === "continuous" ? 50 : legendLabel ? 44 : 28;
    const plotHeight = hasLegend
      ? (plotOptions.height || 281) - legendHeight
      : plotOptions.height || 281;

    const primaryMarkOptions = getMarkOptions(currentColumns, this._type, {
      color: isColor(this._color.column) ? this._color.column : undefined,
      r: this._config.r,
      tip: this._isServer ? false : this._config?.tip, // don't allow tip on the server
      xLabel: plotOptions.x.label,
      yLabel: plotOptions.y.label,
    });

    const topLevelPlotOptions = getTopLevelPlotOptions(
      chartData,
      currentColumns,
      sorts,
      this._type,
      plotOptions,
      this._config
    );

    const primaryMark =
      !currentColumns.includes("x") || !currentColumns.includes("y")
        ? []
        : [Plot[plotMarkType](chartData, primaryMarkOptions)];
    // TODO: double check you don't actually use border color
    const commonPlotMarks = getCommonMarks(this._type, currentColumns);
    const facetMarks = getFacetMarks(chartData, currentColumns);
    const options = {
      ...topLevelPlotOptions,
      marks: [...commonPlotMarks, ...primaryMark, facetMarks],
      ...(document ? { document } : {}),
    };

    // TODO: store as this._plot?
    // TODO: add an option to NOT use PlotFit
    const plt = PlotFit(options, {}, this._font);

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
          plotHeight,
          legendLabel,
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
