import * as Plot from "@observablehq/plot";
import { JSDOM } from "jsdom";
import {
  ChartData,
  ChartType,
  ColorConfig,
  ColumnsConfig,
  PlotConfig,
} from "./types";
import { prepareChartData } from "./prepareChartData";
import {
  getCommonMarks,
  getFacetMarks,
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
import equal from "fast-deep-equal";

export class DuckPlot {
  private _ddb: AsyncDuckDB | null = null;
  private _table: string | null = null;
  private _columns: ColumnsConfig | null = null;
  private _color: ColorConfig | undefined = undefined;
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
      if (!equal(config, this._columns)) {
        this._columns = config;
        this._newDataProps = true; // when changed, we need to requery the data
      }
      return this;
    }
    return this._columns!;
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

  config(): PlotConfig;
  config(config: PlotConfig): this;
  config(config?: PlotConfig): PlotConfig | this {
    if (config) {
      if (!equal(config, this._config)) {
        this._config = config;
      }
      return this;
    }
    return this._config!;
  }

  color(): ColorConfig;
  color(config: ColorConfig): this;
  color(config?: ColorConfig): ColorConfig | this {
    if (config) {
      if (!equal(config, this._color)) {
        this._color = config;
        this._newDataProps = true;
      }
      return this;
    }
    return this._color!;
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
    const primaryMarkOptions = getMarkOptions(currentColumns, this._type, {
      color: typeof this._color === "string" ? this._color : undefined,
      r: this._config?.r,
      tip: this._isServer ? false : this._config?.tip, // don't allow tip on the server
      xLabel: this._config?.xLabel ?? chartData?.labels?.x,
      yLabel: this._config?.yLabel ?? chartData?.labels?.y,
    });
    const topLevelPlotOptions = getTopLevelPlotOptions(
      chartData,
      currentColumns,
      sorts,
      this._type,
      // TODO: pass in plotConfig? or better combine these objects
      {
        width: this._config?.width || 500,
        height: plotHeight,
        xLabel: this._config?.xLabel ?? chartData?.labels?.x,
        yLabel: this._config?.yLabel ?? chartData?.labels?.y,
        xLabelDisplay: this._config?.xLabelDisplay ?? true,
        yLabelDisplay: this._config?.yLabelDisplay ?? true,
        hideTicks: this._config?.hideTicks ?? false,
        color: this._color,
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
        // TODO: better argument order
        legend = legendCategorical(
          this._document,
          Array.from(plt.scale("color")?.domain ?? []),
          Array.from(plt.scale("color")?.range ?? []),
          this._config?.width || 500, // TODO: default width
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
