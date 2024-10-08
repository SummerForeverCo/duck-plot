import * as Plot from "@observablehq/plot";
import { JSDOM } from "jsdom";
import type { Markish, MarkOptions, PlotOptions } from "@observablehq/plot";

import {
  ChartData,
  ChartType,
  Config,
  MarkProperty,
  PlotProperty,
  QueryMap,
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
  private _r: PlotProperty<"r"> = { ...emptyProp };
  private _text: { column: string } = { column: "" };
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
  private _description: string = ""; // TODO: add tests
  private _queries: QueryMap | undefined = undefined; // TODO: add tests
  private _visibleSeries: string[] = [];
  private _chartElement: HTMLElement | null = null;
  private _id: string;

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
    this._id = `duckplot-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
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
    options?: PlotOptions[T],
    propertyName?: string
  ): PlotProperty<T> | this {
    if (column !== undefined && !equal(column, prop.column)) {
      // Special case handling that we don't need data if color is/was a color
      if (
        !(propertyName === "color" && isColor(prop.column) && isColor(column))
      ) {
        this._newDataProps = true; // When changed, we need to requery the data
      }
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

  // x column encoding
  x(): PlotProperty<"x">;
  x(column: string, options?: PlotOptions["x"]): this;
  x(column?: string, options?: PlotOptions["x"]): PlotProperty<"x"> | this {
    return this.handleProperty(this._x, column, options);
  }

  // y column encoding
  y(): PlotProperty<"y">;
  y(column: string, options?: PlotOptions["y"]): this;
  y(column?: string, options?: PlotOptions["y"]): PlotProperty<"y"> | this {
    return this.handleProperty(this._y, column, options);
  }

  // color column encoding
  color(): PlotProperty<"color">;
  color(column: string, options?: PlotOptions["color"]): this;
  color(
    column?: string,
    options?: PlotOptions["color"]
  ): PlotProperty<"color"> | this {
    return this.handleProperty(this._color, column, options, "color");
  }

  // fy column encoding
  // TODO: maybe remove the plotOptions here
  fy(): PlotProperty<"fy">;
  fy(column: string, options?: PlotOptions["fy"]): this;
  fy(column?: string, options?: PlotOptions["fy"]): PlotProperty<"fy"> | this {
    return this.handleProperty(this._fy, column, options);
  }

  // fy column encoding
  // TODO: maybe remove the plotOptions here
  fx(): PlotProperty<"fx">;
  fx(column: string, options?: PlotOptions["fx"]): this;
  fx(column?: string, options?: PlotOptions["fx"]): PlotProperty<"fx"> | this {
    return this.handleProperty(this._fx, column, options);
  }

  // r (radius) column encoding
  r(): PlotProperty<"r">;
  r(column: string, options?: PlotOptions["r"]): this;
  r(column?: string, options?: PlotOptions["r"]): PlotProperty<"r"> | this {
    return this.handleProperty(this._r, column, options);
  }

  // Text encoding: note, there are no options for text
  text(): { column: string };
  text(column: string): this;
  text(column?: string): { column?: string } | this {
    return this.handleProperty(this._text, column);
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

  // TODO; private? Also, rename
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
      ...(this._r.column ? { r: this._r.column } : {}),
      ...(this._text.column ? { text: this._text.column } : {}),
    };
    ({
      data: this._chartData,
      description: this._description,
      queries: this._queries,
    } = await prepareChartData(
      this._ddb,
      this._table,
      columns,
      this._mark.markType!,
      this._query,
      this._config.aggregate
    ));

    return this._chartData;
  }
  async getMarks(): Promise<Markish[]> {
    const allData = this._newDataProps
      ? await this.prepareChartData()
      : this._chartData;

    // Grab the types and labels from the data
    const { types, labels } = allData;

    // Filter down to only the visible series (handled by the legend)
    const chartData: ChartData = this._chartData.filter(
      (d) =>
        this._visibleSeries.length === 0 ||
        this._visibleSeries.includes(`${d.series}`)
    );

    // Reassign the named properties back to the filtered array
    chartData.types = types;
    chartData.labels = labels;
    const plotOptions = await this.getPlotOptions();
    const currentColumns = chartData?.types ? Object.keys(chartData.types) : []; // TODO: remove this arg from topLevelPlotOptions
    const primaryMarkOptions = getMarkOptions(
      currentColumns,
      this._mark.markType,
      {
        color: isColor(this._color.column) ? this._color.column : undefined,
        tip: this._isServer ? false : this._config?.tip, // don't allow tip on the server
        xLabel: plotOptions.x?.label ?? "",
        yLabel: plotOptions.y?.label ?? "",
        markOptions: this._mark.options,
      }
    );

    // Here, we want to add the primary mark if x and y are defined OR if an
    // aggregate has been specifid. Not a great rule, but works for now for
    // showing aggregate marks with only one dimension
    const primaryMark =
      (!currentColumns.includes("x") || !currentColumns.includes("y")) &&
      !this._config.aggregate
        ? []
        : [
            Plot[this._mark.markType](
              chartData,
              primaryMarkOptions as MarkOptions
            ),
          ];
    // TODO: double check you don't actually use border color
    // If a user supplies marks, don't add the common marks
    const commonPlotMarks =
      this._options.marks ?? getCommonMarks(currentColumns);
    const fyMarks = getfyMarks(chartData, currentColumns, plotOptions.fy);
    return [
      ...(fyMarks || []),
      ...(commonPlotMarks || []),
      ...(primaryMark || []),
    ];
  }

  async getPlotOptions(): Promise<PlotOptions> {
    //
    const chartData = this._newDataProps
      ? await this.prepareChartData()
      : this._chartData;
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

    // Fallback to computed labels if they are undefined
    if (plotOptions.x.label === undefined)
      plotOptions.x.label = chartData.labels?.x;
    if (plotOptions.y.label === undefined)
      plotOptions.y.label = chartData.labels?.y;
    if (plotOptions.color.label === undefined)
      plotOptions.color.label = chartData.labels?.series;
    return plotOptions;
  }
  describe(): string {
    return this._description;
  }
  queries(): QueryMap | undefined {
    return this._queries;
  }
  async render(): Promise<SVGElement | HTMLElement | null> {
    if (!this._mark) return null;
    const marks = await this.getMarks();
    const chartData = this._chartData; // this is updated by getMarks

    const currentColumns = chartData?.types ? Object.keys(chartData.types) : []; // TODO: remove this arg from topLevelPlotOptions
    const document = this._isServer ? this._jsdom!.window.document : undefined;

    // TODO: custom sorts as inputs
    const sorts = getSorts(currentColumns, chartData);
    const plotOptions = await this.getPlotOptions();
    // Note, displaying legends by default
    const legendDisplay = plotOptions.color?.legend ?? true;
    const hasLegend = chartData.types?.series !== undefined && legendDisplay;
    const legendType =
      plotOptions.color?.type ?? getLegendType(chartData, currentColumns);
    // TODO: maybe rename series to color....?
    const legendLabel = plotOptions.color?.label;

    // Different legend height for continuous, leave space for categorical label
    const legendHeight =
      legendType === "continuous" ? 50 : legendLabel ? 44 : 28;
    plotOptions.height = hasLegend
      ? (plotOptions.height || 281) - legendHeight
      : plotOptions.height || 281;

    const topLevelPlotOptions = getTopLevelPlotOptions(
      chartData,
      currentColumns,
      sorts,
      this._mark.markType,
      plotOptions,
      this._config
    );

    const options = {
      ...topLevelPlotOptions,
      marks,
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
    wrapper.id = this._id;

    // Find the parent of the existing chart element
    const parentElement = this._chartElement?.parentElement;

    // Replace existing content if there's a parent (for interactions)
    if (parentElement) {
      const existingWrapper = parentElement.querySelector(`#${this._id}`);
      if (existingWrapper) {
        existingWrapper.innerHTML = "";
        existingWrapper.appendChild(wrapper);
      } else {
        parentElement.appendChild(wrapper);
      }
    }
    if (hasLegend) {
      let legend: HTMLDivElement;
      const div = this._document.createElement("div");

      if (legendType === "categorical") {
        console.log(chartData);
        const categories = [...new Set(chartData.map((d) => `${d.series}`))]; // stringify in case of numbers as categories

        if (this._visibleSeries.length === 0) {
          this._visibleSeries = categories;
        }
        // TODO: better argument order
        legend = legendCategorical(
          this._document,
          categories,
          this._visibleSeries,
          Array.from(plt.scale("color")?.range ?? []),
          plotOptions?.width || 500, // TODO: default width
          plotOptions.height,
          legendLabel ?? "",
          this._font
        );
        // TODO: add a config option for this
        const legendElements =
          legend.querySelectorAll<HTMLElement>(".dp-category");

        legendElements.forEach((element: SVGElement | HTMLElement) => {
          const elementId = `${element.textContent}`; // stringify in case of numbers as categories
          if (!elementId) return;
          element.addEventListener("click", (event) => {
            const mouseEvent = event as MouseEvent;
            // Shift-click: hide all others
            if (mouseEvent.shiftKey) {
              // If this is the only visible element, reset all to visible
              if (
                this._visibleSeries.length === 1 &&
                this._visibleSeries.includes(elementId)
              ) {
                this._visibleSeries = categories;
              } else {
                this._visibleSeries = [elementId]; // show only this one
              }
            } else {
              // Regular click: toggle visibility of the clicked element
              if (this._visibleSeries.includes(elementId)) {
                this._visibleSeries = this._visibleSeries.filter(
                  (id) => id !== elementId
                ); // Hide the clicked element
              } else {
                this._visibleSeries.push(elementId); // Show the clicked element
              }
            }
            this.render();
          });
        });
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
    this._chartElement = wrapper; // track this for re-rendering via interactivity
    return wrapper;
  }
}
