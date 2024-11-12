import * as Plot from "@observablehq/plot";
import { JSDOM } from "jsdom";
import type { Markish, MarkOptions, PlotOptions } from "@observablehq/plot";

import {
  BasicColumnType,
  ChartData,
  ChartType,
  ColumnType,
  Config,
  IncomingColumType,
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
import { getUniqueId, processRawData } from "./helpers";
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
  private _rawData: ChartData = [];
  private _filteredData: ChartData = [];
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
    this._id = getUniqueId();
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
    column?: IncomingColumType,
    options?: PlotOptions[T],
    propertyName?: string
  ): PlotProperty<T> | this {
    // Because we store empty string for falsey values, we need to check them
    const columnValue = column === false || column === null ? "" : column;

    if (column !== undefined && !equal(columnValue, prop.column)) {
      // Special case handling that we don't need data if color is/was a color
      if (
        !(
          propertyName === "color" &&
          isColor(prop.column) &&
          typeof column === "string" &&
          isColor(column)
        )
      ) {
        this._newDataProps = true; // When changed, we need to requery the data
      }
    }
    if (column === false || column === null) {
      prop.column = "";
      prop.options = undefined;
    } else {
      if (column !== undefined) prop.column = column;
      if (options !== undefined) prop.options = options;
    }
    return column === undefined ? prop : this;
  }

  // x column encoding
  x(): PlotProperty<"x">;
  x(column: IncomingColumType, options?: PlotOptions["x"]): this;
  x(
    column?: IncomingColumType,
    options?: PlotOptions["x"]
  ): PlotProperty<"x"> | this {
    return this.handleProperty(this._x, column, options);
  }

  // y column encoding
  y(): PlotProperty<"y">;
  y(column: IncomingColumType, options?: PlotOptions["y"]): this;
  y(
    column?: IncomingColumType,
    options?: PlotOptions["y"]
  ): PlotProperty<"y"> | this {
    return this.handleProperty(this._y, column, options);
  }

  // color column encoding
  color(): PlotProperty<"color">;
  color(column: IncomingColumType, options?: PlotOptions["color"]): this;
  color(
    column?: IncomingColumType,
    options?: PlotOptions["color"]
  ): PlotProperty<"color"> | this {
    return this.handleProperty(this._color, column, options, "color");
  }

  // fy column encoding
  // TODO: maybe remove the plotOptions here
  fy(): PlotProperty<"fy">;
  fy(column: IncomingColumType, options?: PlotOptions["fy"]): this;
  fy(
    column?: IncomingColumType,
    options?: PlotOptions["fy"]
  ): PlotProperty<"fy"> | this {
    return this.handleProperty(this._fy, column, options);
  }

  // fy column encoding
  // TODO: maybe remove the plotOptions here
  fx(): PlotProperty<"fx">;
  fx(column: IncomingColumType, options?: PlotOptions["fx"]): this;
  fx(
    column?: IncomingColumType,
    options?: PlotOptions["fx"]
  ): PlotProperty<"fx"> | this {
    return this.handleProperty(this._fx, column, options);
  }

  // r (radius) column encoding
  r(): PlotProperty<"r">;
  r(column: IncomingColumType, options?: PlotOptions["r"]): this;
  r(
    column?: IncomingColumType,
    options?: PlotOptions["r"]
  ): PlotProperty<"r"> | this {
    return this.handleProperty(this._r, column, options);
  }

  // Text encoding: note, there are no options for text
  text(): { column: string };
  text(column: IncomingColumType): this;
  text(column?: IncomingColumType): { column?: ColumnType } | this {
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
      // Reset the data if the aggregate or percent has changed
      if (
        this._config.aggregate !== config.aggregate ||
        this._config.percent !== config.percent
      ) {
        this._newDataProps = true;
      }
      this._config = config;
      return this;
    }
    return this._config;
  }

  data(): ChartData {
    return this._chartData || [];
  }

  // If someone wants to set the data directly rather than working with duckdb
  // TODO: should this just be how the data() method works when passed args...?
  rawData(): ChartData;
  rawData(data?: ChartData, types?: { [key: string]: BasicColumnType }): this;
  rawData(
    data?: ChartData,
    types?: { [key: string]: BasicColumnType }
  ): ChartData | this {
    if (data && types) {
      data.types = types;
      this._newDataProps = true;
      this._rawData = data;
      return this;
    }
    return this._chartData; // TODO: does this make sense...?
  }

  // TODO; private? Also, rename
  async prepareChartData(): Promise<ChartData> {
    // If no new data properties, return the chartData
    if (!this._newDataProps) return this._chartData;

    // If there is raw data rather than a database, extract chart data from it
    if (this._rawData && this._rawData.types) {
      this._chartData = processRawData(this._rawData, {
        x: this._x.column,
        y: this._y.column,
        color: this._color.column,
        fy: this._fy.column,
        fx: this._fx.column,
        r: this._r.column,
        text: this._text.column,
      });
      this._newDataProps = false;
      this._visibleSeries = []; // reset visible series
      return this._chartData;
    }
    if (!this._ddb || !this._table)
      throw new Error("Database and table not set");
    // TODO: this error isn't being thrown when I'd expect (e.g, if type is not set)
    if (!this._mark) throw new Error("Mark type not set");
    this._newDataProps = false;
    this._visibleSeries = []; // reset visible series
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
      this._config.aggregate,
      this._config.percent
    ));
    return this._chartData;
  }
  async getMarks(): Promise<Markish[]> {
    const allData = await this.prepareChartData();

    // Grab the types and labels from the data
    const { types, labels } = allData;

    // Filter down to only the visible series (handled by the legend)
    this._filteredData = this._chartData.filter(
      (d) =>
        this._visibleSeries.length === 0 ||
        this._visibleSeries.includes(`${d.series}`)
    );

    // Reassign the named properties back to the filtered array
    this._filteredData.types = types;
    this._filteredData.labels = labels;
    const plotOptions = await this.getPlotOptions();
    const currentColumns = this._filteredData?.types
      ? Object.keys(this._filteredData.types)
      : []; // TODO: remove this arg from topLevelPlotOptions
    const primaryMarkOptions = getMarkOptions(
      currentColumns,
      this._mark.markType,
      types,
      {
        color: isColor(this._color.column)
          ? String(this._color.column)
          : undefined,
        tip: this._isServer ? false : this._config?.tip, // don't allow tip on the server
        xLabel: this._config.tipLabels?.x ?? plotOptions.x?.label ?? "",
        yLabel: this._config.tipLabels?.y ?? plotOptions.y?.label ?? "",
        xValue: this._config.tipValues?.x,
        yValue: this._config.tipValues?.y,
        // TODO: suppport colorLabel, colorValue
        markOptions: this._mark.options,
      }
    );

    // Here, we want to add the primary mark if x and y are defined OR if an
    // aggregate has been specifid. Not a great rule, but works for now for
    // showing aggregate marks with only one dimension
    const isValidTickChart =
      (this._mark.markType === "tickX" && currentColumns.includes("x")) ||
      (this._mark.markType === "tickY" && currentColumns.includes("y"));

    const primaryMark =
      !isValidTickChart &&
      (!currentColumns.includes("x") || !currentColumns.includes("y")) &&
      !this._config.aggregate
        ? []
        : [
            Plot[this._mark.markType](
              this._filteredData,
              primaryMarkOptions as MarkOptions
            ),
          ];

    // TODO: double check you don't actually use border color
    // TODO: Make frame/grid config options(?)
    const commonPlotMarks = [
      ...getCommonMarks(currentColumns),
      ...(this._options.marks || []),
    ];

    const fyMarks = getfyMarks(
      this._filteredData,
      currentColumns,
      plotOptions.fy
    );
    return [
      ...(fyMarks || []),
      ...(commonPlotMarks || []),
      ...(primaryMark || []),
    ];
  }

  async getPlotOptions(): Promise<PlotOptions> {
    const chartData = await this.prepareChartData();

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
    const marks = await this.getMarks(); // updates this._chartData and this._filteredData
    const currentColumns = this._chartData?.types
      ? Object.keys(this._chartData.types)
      : []; // TODO: remove this arg from topLevelPlotOptions
    const document = this._isServer ? this._jsdom!.window.document : undefined;
    // Because the sort can be specified in the options, remove any colums who
    // have a sort specified
    const haveSorts = Object.keys(this._mark?.options?.sort ?? {});
    let sorts = getSorts(
      currentColumns.filter((d) => d !== "fy" && !haveSorts.includes(d)),
      this._chartData,
      this._color.options?.type === "categorical"
    );
    // Only display the facets for present data
    if (currentColumns.includes("fy")) {
      sorts.fy = getSorts(
        ["fy"],
        this._filteredData,
        this._color.options?.type === "categorical"
      );
    }
    const plotOptions = await this.getPlotOptions();
    // Note, displaying legends by default
    const legendDisplay = plotOptions.color?.legend ?? true;
    const hasLegend =
      this._chartData.types?.series !== undefined && legendDisplay;
    const legendType =
      plotOptions.color?.type ?? getLegendType(this._chartData, currentColumns);
    // TODO: maybe rename series to color....?
    const legendLabel = plotOptions.color?.label;

    // Different legend height for continuous, leave space for categorical label
    const legendHeight =
      legendType === "continuous" ? 50 : legendLabel ? 44 : 28;
    plotOptions.height = hasLegend
      ? (plotOptions.height || 281) - legendHeight
      : plotOptions.height || 281;

    const topLevelPlotOptions = getTopLevelPlotOptions(
      this._chartData,
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
    let wrapper: HTMLElement | SVGElement | null = null;

    // Find the parent of the existing chart element
    const parentElement = this._chartElement?.parentElement;
    // Replace existing content if there's a parent (for interactions)
    if (parentElement) {
      const existingWrapper = parentElement.querySelector(`#${this._id}`);
      if (existingWrapper) {
        wrapper = existingWrapper as HTMLElement | SVGElement;
        wrapper.innerHTML = "";
      }
    } else {
      wrapper = this._document.createElement("div");
      wrapper.id = this._id;
    }
    if (hasLegend) {
      let legend: HTMLDivElement;
      const div = this._document.createElement("div");

      if (legendType === "categorical") {
        // stringify in case of numbers as categories
        const categories = Array.from(plt.scale("color")?.domain ?? [])?.map(
          (d) => `${d}`
        );

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
        if (this._config.interactiveLegend !== false) {
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
        }
      } else {
        legend = legendContinuous({
          color: { ...plt.scale("color") },
          label: legendLabel,
          ...(document ? { document } : {}),
        });
      }
      div.appendChild(legend);
      if (wrapper) wrapper?.appendChild(div);
    }
    if (wrapper) {
      wrapper.appendChild(plt);
      this._chartElement = wrapper as HTMLElement; // track this for re-rendering via interactivity
    }
    return wrapper ?? null;
  }
}
