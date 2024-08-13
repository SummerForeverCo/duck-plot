import * as Plot from "@observablehq/plot";
import { JSDOM } from "jsdom";
import {
  ChartData,
  ChartType,
  ColumnsConfig,
  DataConfig,
  PlotConfig,
} from "./types";
import { prepareChartData } from "./prepareChartData";
import {
  getCommonMarks,
  getFacetMarks,
  getLegendOptions,
  getMarkOptions,
  getPlotMarkType,
  getSorts,
  getTopLevelPlotOptions,
} from "./getPlotOptions";
import { PlotFit } from "./plotFit";

export class DuckPlot {
  private _data: DataConfig | null = null;
  private _columns: ColumnsConfig | null = null;
  private _type: ChartType | null = null;
  private _config: PlotConfig | null = null;
  private _jsdom: JSDOM | undefined;
  private _font: any;
  private _isServer: boolean;
  private _document: Document;

  constructor({ jsdom, font }: { jsdom?: JSDOM; font?: any } = {}) {
    this._jsdom = jsdom;
    this._font = font;
    this._isServer = jsdom !== undefined;
    this._document = this._isServer
      ? this._jsdom!.window.document
      : window.document;
  }

  data(): DataConfig;
  data(config: DataConfig): this;
  data(config?: DataConfig): DataConfig | this {
    if (config) {
      this._data = config;
      return this;
    }
    return this._data!;
  }

  columns(): ColumnsConfig;
  columns(config: ColumnsConfig): this;
  columns(config?: ColumnsConfig): ColumnsConfig | this {
    if (config) {
      this._columns = config;
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
    if (!this._data) throw new Error("Data configuration is not set");
    return prepareChartData(
      this._data.ddb,
      this._data.table,
      this._columns!,
      this._type!
    );
  }

  async plot(): Promise<SVGElement | HTMLElement | null> {
    if (!this._type) return null;
    const chartData = await this.prepareChartData();
    const document = this._isServer ? this._jsdom!.window.document : undefined;
    const currentColumns = chartData?.types ? Object.keys(chartData.types) : []; // TODO: remove this arg from topLevelPlotOptions
    const sorts = getSorts(currentColumns, chartData);
    const plotMarkType = getPlotMarkType(this._type);
    // TODO: maybe just pass plotConfig?
    const primaryMarkOptions = getMarkOptions(
      currentColumns,
      this._type,
      {
        color: this._config?.color,
        r: this._config?.r,
        xLabel: this._config?.xLabel || chartData?.labels?.x,
        yLabel: this._config?.yLabel || chartData?.labels?.y,
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
        height: this._config?.height || 500,
        xLabel: this._config?.xLabel || chartData?.labels?.x,
        yLabel: this._config?.yLabel || chartData?.labels?.y,
        xLabelDisplay: this._config?.xLabelDisplay ?? true,
        yLabelDisplay: this._config?.yLabelDisplay ?? true,
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

    // TODO: store as this._plot
    // TODO: add an option to NOT use PlotFit
    const plt = PlotFit(options, {}, this._font);
    plt.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const legendOptions = getLegendOptions(
      chartData,
      currentColumns,
      chartData?.labels?.series
    );

    if (currentColumns.includes("series")) {
      const fo = this._document.createElementNS(
        "http://www.w3.org/2000/svg",
        "foreignObject"
      );
      // TODO set these as defaults
      fo.setAttribute("width", `${this._config?.width || 500}`);
      fo.setAttribute("height", `${this._config?.height || 500}`);
      fo.setAttribute("x", `0`);
      fo.setAttribute("y", `-25`);
      const legend = Plot.legend({
        ...legendOptions,
        ...(document ? { document } : {}),
      });
      legend.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      fo.appendChild(legend);
      plt?.appendChild(fo);
    }
    return plt;
  }
}
