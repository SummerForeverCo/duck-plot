import * as Plot from "@observablehq/plot";
import { JSDOM } from "jsdom";
import type { Markish, PlotOptions } from "@observablehq/plot";

import {
  BasicColumnType,
  Data,
  ChartType,
  ColumnType,
  Config,
  IncomingColumType,
  MarkProperty,
  PlotProperty,
  QueryMap,
  Sorts,
} from "./types";
import { prepareData } from "./data/prepareData";
import { getLegendType, getSorts } from "./options/getPlotOptions";
import "./legend/legend.css";
import { AsyncDuckDB } from "@duckdb/duckdb-wasm";
import { getUniqueId, processRawData } from "./helpers";
import { derivePlotOptions } from "./options/derivePlotOptions";
import { handleProperty } from "./handleProperty";
import { getAllMarkOptions } from "./options/getAllMarkOptions";
import { render } from "./render/render";
import { renderError } from "./render/renderError";
const emptyProp = { column: "", options: {} };
export class DuckPlot {
  private _ddb: AsyncDuckDB | undefined | null = null;
  private _table: string | null = null;
  private _x: PlotProperty<"x"> = { ...emptyProp };
  private _y: PlotProperty<"y"> = { ...emptyProp };
  private _fy: PlotProperty<"fy"> = { ...emptyProp };
  private _fx: PlotProperty<"fx"> = { ...emptyProp };
  private _r: PlotProperty<"r"> = { ...emptyProp };
  private _text: { column: string } = { column: "" };
  private _color: PlotProperty<"color"> = { ...emptyProp };
  private _mark: MarkProperty = {};
  private _options: PlotOptions = {};
  private _jsdom: JSDOM | undefined;
  private _font: any;
  private _isServer: boolean;
  private _document: Document;
  private _newDataProps: boolean = true;
  private _data: Data = [];
  private _rawData: Data = [];
  private _config: Config = {};
  private _query: string = "";
  private _description: string = ""; // TODO: add tests
  private _queries: QueryMap | undefined = undefined; // TODO: add tests
  private _id: string;
  private _sorts: Record<string, { domain: string[] } | undefined> = {};
  private _hasLegend: boolean | undefined;
  private _legendType:
    | Plot.ScaleType
    | "categorical"
    | "continuous"
    | undefined;
  // Rather than provide getter/setters, just make these public
  plotObject: ((HTMLElement | SVGSVGElement) & Plot.Plot) | undefined =
    undefined;
  visibleSeries: string[] = [];
  filteredData: Data | undefined = undefined;
  chartElement: HTMLElement | null = null;
  seriesDomain: number[] = [];

  constructor(
    ddb?: AsyncDuckDB | null, // Allow null so you can work on the server without a database
    { jsdom, font }: { jsdom?: JSDOM; font?: any } = {}
  ) {
    this._ddb = ddb;
    this._jsdom = jsdom;
    this._font = font;
    this._isServer = jsdom !== undefined;
    this._document = this._isServer
      ? this._jsdom!.window.document
      : window?.document;
    this._id = getUniqueId();
  }

  // Set the table to query against
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

  // x column encoding
  x(): PlotProperty<"x">;
  x(column: IncomingColumType, options?: PlotOptions["x"]): this;
  x(
    column?: IncomingColumType,
    options?: PlotOptions["x"]
  ): PlotProperty<"x"> | DuckPlot {
    return handleProperty(this, this._x, column, options);
  }

  // y column encoding
  y(): PlotProperty<"y">;
  y(column: IncomingColumType, options?: PlotOptions["y"]): this;
  y(
    column?: IncomingColumType,
    options?: PlotOptions["y"]
  ): PlotProperty<"y"> | DuckPlot {
    return handleProperty(this, this._y, column, options);
  }

  // color column encoding
  color(): PlotProperty<"color">;
  color(column: IncomingColumType, options?: PlotOptions["color"]): this;
  color(
    column?: IncomingColumType,
    options?: PlotOptions["color"]
  ): PlotProperty<"color"> | DuckPlot {
    return handleProperty(this, this._color, column, options, "color");
  }

  // fy column encoding
  // TODO: maybe remove the plotOptions here
  fy(): PlotProperty<"fy">;
  fy(column: IncomingColumType, options?: PlotOptions["fy"]): this;
  fy(
    column?: IncomingColumType,
    options?: PlotOptions["fy"]
  ): PlotProperty<"fy"> | DuckPlot {
    return handleProperty(this, this._fy, column, options);
  }

  // fy column encoding
  // TODO: maybe remove the plotOptions here
  fx(): PlotProperty<"fx">;
  fx(column: IncomingColumType, options?: PlotOptions["fx"]): this;
  fx(
    column?: IncomingColumType,
    options?: PlotOptions["fx"]
  ): PlotProperty<"fx"> | DuckPlot {
    return handleProperty(this, this._fx, column, options);
  }

  // r (radius) column encoding
  r(): { column: string };
  r(column: IncomingColumType): this;
  r(column?: IncomingColumType): { column?: ColumnType } | DuckPlot {
    return handleProperty(this, this._r, column);
  }

  // Text encoding: note, there are no options for text
  text(): { column: string };
  text(column: IncomingColumType): this;
  text(column?: IncomingColumType): { column?: ColumnType } | DuckPlot {
    return handleProperty(this, this._text, column);
  }

  // Observable Plot Mark type and options
  mark(): MarkProperty;
  mark(type: ChartType, options?: MarkProperty["options"]): this;
  mark(
    type?: ChartType,
    options?: MarkProperty["options"]
  ): MarkProperty | this {
    if (type) {
      if (this._mark.type !== type) {
        this._newDataProps = true; // when changed, we need to requery the data
      }
      this._mark = { type, ...(options ? { options } : {}) };
      return this;
    }
    return this._mark!;
  }

  options(): PlotOptions;
  options(opts: PlotOptions): this;
  options(opts?: PlotOptions): PlotOptions | this {
    if (opts) {
      this._options = opts;
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

  // If someone wants to set the data directly rather than working with duckdb
  rawData(): Data;
  rawData(data?: Data, types?: { [key: string]: BasicColumnType }): this;
  rawData(
    data?: Data,
    types?: { [key: string]: BasicColumnType }
  ): Data | this {
    if (data && types) {
      data.types = types;
      this._newDataProps = true;
      this._rawData = data;
      return this;
    }
    return this._rawData;
  }

  // Getter/setter methods for accesssing and setting values
  get newDataProps(): boolean {
    return this._newDataProps;
  }
  set newDataProps(newValue: boolean) {
    this._newDataProps = newValue;
  }

  get ddb(): AsyncDuckDB | null | undefined {
    return this._ddb;
  }
  get isServer(): boolean {
    return this._isServer;
  }

  get document(): Document {
    return this._document;
  }

  get font(): any {
    return this._font;
  }
  get jsdom(): any {
    return this._jsdom;
  }
  get id(): string {
    return this._id;
  }
  data(): Data {
    return this._data || [];
  }

  async prepareData(): Promise<Data> {
    // If no new data properties, return the data
    if (!this._newDataProps) return this._data;

    // If there is raw data rather than a database, extract chart data from it
    if (this._rawData && this._rawData.types) {
      this._data = processRawData(this);
      this._newDataProps = false;
      this.visibleSeries = []; // reset visible series
      return this._data;
    }
    // TODO: move this error handling.... somewhere else
    if (!this._ddb) throw new Error("Database not set");
    if (!this._table) throw new Error("Table not set");
    if (!this._mark.type) throw new Error("Mark type not set");
    const multipleX =
      Array.isArray(this._x.column) && this._x.column.length > 1;
    const multipleY =
      Array.isArray(this._y.column) && this._y.column.length > 1;
    if (multipleX && this._mark.type !== "barX")
      throw new Error("Multiple x columns only supported for barX type");
    if (multipleY && this._mark.type === "barX")
      throw new Error("Multiple y columns not supported for barX type");
    this._newDataProps = false;
    this.visibleSeries = []; // reset visible series
    const { data, description, queries } = await prepareData(this);
    this._data = data;
    this._description = description;
    this._queries = queries;
    return this._data;
  }

  sorts(): Sorts | undefined {
    return this._sorts;
  }
  async getAllMarkOptions(): Promise<Markish[]> {
    return await getAllMarkOptions(this);
  }

  // Because users can specify options either in .options or with each column, we coalese them here
  async derivePlotOptions(): Promise<PlotOptions> {
    return await derivePlotOptions(this);
  }
  describe(): string {
    return this._description;
  }
  queries(): QueryMap | undefined {
    return this._queries;
  }

  // Set the sorts for the plot
  setSorts() {
    this._sorts = getSorts(this) ?? {};
    // Only display the facets for present data
    if (Object.keys(this._data?.types ?? {}).includes("fy")) {
      this._sorts = {
        ...this._sorts,
        fy: getSorts(this, ["fy"], this.filteredData).fy,
      };
    }
  }
  // Track the legend type and visibility
  setLegend(plotOptions: Plot.PlotOptions) {
    // Note, displaying legends by default
    this._hasLegend =
      this._data.types?.series !== undefined &&
      plotOptions.color?.legend !== null &&
      plotOptions.color?.legend !== false;
    this._legendType = plotOptions.color?.type ?? getLegendType(this._data);
  }
  getLegendSettings() {
    return {
      hasLegend: this._hasLegend,
      legendType: this._legendType,
    };
  }
  async render(
    newLegend: boolean = true
  ): Promise<SVGElement | HTMLElement | null> {
    try {
      return await render(this, newLegend);
    } catch (error) {
      return await renderError(this, error);
    }
  }
}
