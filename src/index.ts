import * as Plot from "@observablehq/plot";
import { JSDOM } from "jsdom";
import { ChartData, ChartType, ColumnsConfig, PlotConfig } from "./types";
import { prepareChartData } from "./prepareChartData";
import {
  getCommonMarks,
  getFacetMarks,
  getLegendOptions,
  getLegendType,
  getMarkOptions,
  getPlotMarkType,
  getSorts,
  getTopLevelPlotOptions,
} from "./getPlotOptions";
import { PlotFit } from "./plotFit";
import { legendCategorical } from "./legendCategorical";
import "./legend.css";
import { legendContinuous } from "./legendContinuous";
import { AsyncDuckDB } from "@duckdb/duckdb-wasm";

export class DuckPlot {
  private _ddb: AsyncDuckDB | null = null;
  private _table: string | null = null;
  private _columns: ColumnsConfig | null = null;
  private _type: ChartType | null = null;
  private _config: PlotConfig | null = null;
  private _jsdom: JSDOM | undefined;
  private _font: any;
  private _isServer: boolean;
  private _document: Document;
  private _newDataProps: boolean = true;
  private _chartData: ChartData = [];

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

  columns(): ColumnsConfig;
  columns(config: ColumnsConfig): this;
  columns(config?: ColumnsConfig): ColumnsConfig | this {
    // Check for no changes
    if (config) {
      this._columns = config;
      this._newDataProps = true; // when changed, we need to requery the data
      return this;
    }
    return this._columns!;
  }

  x(): string;
  x(value: string): this;
  x(value?: string): string | this {
    if (value) {
      if (this._columns) {
        this._columns.x = value;
      } else {
        this._columns = { x: value, y: "", series: "" };
      }
      return this;
    }
    return this._columns?.x!;
  }

  y(): string;
  y(value: string): this;
  y(value?: string): string | this {
    if (value) {
      if (this._columns) {
        this._columns.y = value;
      } else {
        this._columns = { x: "", y: value, series: "" };
      }
      return this;
    }
    return this._columns?.y!;
  }

  series(): string;
  series(value: string): this;
  series(value?: string): string | this {
    if (value) {
      if (this._columns) {
        this._columns.series = value;
      } else {
        this._columns = { x: "", y: "", series: value };
      }
      return this;
    }
    return this._columns?.series!;
  }

  type(): ChartType;
  type(value: ChartType): this;
  type(value?: ChartType): ChartType | this {
    if (value) {
      this._type = value;
      this._newDataProps = true; // when changed, we need to requery the data
      return this;
    }
    return this._type!;
  }

  config(): PlotConfig;
  config(config: PlotConfig): this;
  config(config?: PlotConfig): PlotConfig | this {
    if (config) {
      this._config = config;
      return this;
    }
    return this._config!;
  }

  async prepareChartData(): Promise<ChartData> {
    if (!this._ddb || !this._table)
      throw new Error("Database and table not set");
    this._newDataProps = false;
    return prepareChartData(
      this._ddb,
      this._table,
      this._columns!,
      this._type!
    );
  }

  async render(): Promise<SVGElement | HTMLElement | null> {
    if (!this._type) return null;

    const chartData = this._newDataProps
      ? await this.prepareChartData()
      : this._chartData;
    this._chartData = chartData;
    const document = this._isServer ? this._jsdom!.window.document : undefined;
    const currentColumns = chartData?.types ? Object.keys(chartData.types) : []; // TODO: remove this arg from topLevelPlotOptions
    const sorts = getSorts(currentColumns, chartData);
    const plotMarkType = getPlotMarkType(this._type);
    const legendDisplay = this._config?.legendDisplay ?? true;
    const hasLegend = chartData.types?.series !== undefined && legendDisplay;
    const legendType = getLegendType(chartData, currentColumns);
    const legendLabel = this._config?.legendLabel ?? chartData.labels?.series;

    // Different legend height for continuous, leave space for categorical label
    const legendHeight =
      legendType === "continuous" ? 50 : legendLabel ? 44 : 28;
    const plotHeight = hasLegend
      ? (this._config?.height || 281) - legendHeight
      : this._config?.height || 281;
    // TODO: maybe just pass plotConfig?
    const primaryMarkOptions = getMarkOptions(
      currentColumns,
      this._type,
      {
        color: this._config?.color,
        r: this._config?.r,
        xLabel: this._config?.xLabel ?? chartData?.labels?.x,
        yLabel: this._config?.yLabel ?? chartData?.labels?.y,
      },
      document === undefined // TODO: arg order / better varname
    );
    const topLevelPlotOptions = getTopLevelPlotOptions(
      chartData,
      currentColumns,
      sorts,
      this._type,
      {
        width: this._config?.width || 500,
        height: plotHeight,
        xLabel: this._config?.xLabel ?? chartData?.labels?.x,
        yLabel: this._config?.yLabel ?? chartData?.labels?.y,
        xLabelDisplay: this._config?.xLabelDisplay ?? true,
        yLabelDisplay: this._config?.yLabelDisplay ?? true,
        hideTicks: this._config?.hideTicks ?? false,
      }
    );

    const primaryMark = [Plot[plotMarkType](chartData, primaryMarkOptions)];
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
        const categories = [...new Set(chartData.map((d) => d.series))];

        legend = legendCategorical(
          this._document,
          categories,
          this._config?.width || 500, // TODO: default width
          legendLabel,
          this._font
        );
      } else {
        const legendOptions = getLegendOptions(
          chartData,
          currentColumns,
          legendLabel
        );
        legend = legendContinuous({
          ...legendOptions,
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
