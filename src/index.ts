import type { AsyncDuckDB } from "@duckdb/duckdb-wasm";
import * as Plot from "@observablehq/plot";
import { JSDOM } from "jsdom";
import { ChartData, ChartType } from "./types";
import { prepareChartData } from "./prepareChartData";

interface DataConfig {
  ddb: AsyncDuckDB;
  table: string;
}

interface ColumnsConfig {
  x: string;
  y: string;
  series: string;
  facet?: string;
}

interface PlotConfig {
  xAxisLabel?: string;
  yAxisLabel?: string;
  height?: number;
  width?: number;
  xAxisDisplay?: boolean;
  yAxisDisplay?: boolean;
  titleDisplay?: boolean;
}

export class DuckPlot {
  private dataConfig: DataConfig | null = null;
  private columnsConfig: ColumnsConfig | null = null;
  private plotType: ChartType | null = null;
  private plotConfig: PlotConfig | null = null;
  private jsdom: JSDOM | undefined;
  private isServer: boolean;

  constructor(jsdom?: JSDOM) {
    this.jsdom = jsdom;
    this.isServer = jsdom !== undefined;
  }

  data(): DataConfig;
  data(config: DataConfig): this;
  data(config?: DataConfig): DataConfig | this {
    if (config) {
      this.dataConfig = config;
      return this;
    }
    return this.dataConfig!;
  }

  columns(): ColumnsConfig;
  columns(config: ColumnsConfig): this;
  columns(config?: ColumnsConfig): ColumnsConfig | this {
    if (config) {
      this.columnsConfig = config;
      return this;
    }
    return this.columnsConfig!;
  }

  x(): string;
  x(value: string): this;
  x(value?: string): string | this {
    if (value) {
      if (this.columnsConfig) {
        this.columnsConfig.x = value;
      } else {
        this.columnsConfig = { x: value, y: "", series: "" };
      }
      return this;
    }
    return this.columnsConfig?.x!;
  }

  y(): string;
  y(value: string): this;
  y(value?: string): string | this {
    if (value) {
      if (this.columnsConfig) {
        this.columnsConfig.y = value;
      } else {
        this.columnsConfig = { x: "", y: value, series: "" };
      }
      return this;
    }
    return this.columnsConfig?.y!;
  }

  series(): string;
  series(value: string): this;
  series(value?: string): string | this {
    if (value) {
      if (this.columnsConfig) {
        this.columnsConfig.series = value;
      } else {
        this.columnsConfig = { x: "", y: "", series: value };
      }
      return this;
    }
    return this.columnsConfig?.series!;
  }

  type(): ChartType;
  type(value: ChartType): this;
  type(value?: ChartType): ChartType | this {
    if (value) {
      this.plotType = value;
      return this;
    }
    return this.plotType!;
  }

  config(): PlotConfig;
  config(config: PlotConfig): this;
  config(config?: PlotConfig): PlotConfig | this {
    if (config) {
      this.plotConfig = config;
      return this;
    }
    return this.plotConfig!;
  }

  async prepareChartData(): Promise<ChartData> {
    if (!this.dataConfig) throw new Error("Data configuration is not set");
    return prepareChartData(
      this.dataConfig.ddb,
      this.dataConfig.table,
      this.columnsConfig!,
      this.plotType!
    );
  }

  async plot(): Promise<SVGSVGElement | HTMLElement | null> {
    if (!this.plotType) return null;
    const chartData = await this.prepareChartData();
    const document = this.isServer ? this.jsdom!.window.document : undefined;
    const labels = chartData.labels;
    const plotConfig = {
      marks: [
        Plot[this.plotType as "dot" | "areaY" | "line" | "barX" | "barY"](
          chartData,
          {
            ...(this.columnsConfig!.x ? { x: "x" } : {}),
            ...(this.columnsConfig!.y ? { y: "y" } : {}),
            ...(this.columnsConfig!.series ? { stroke: "series" } : {}),
          }
        ),
      ],
      x: {
        ...(this.plotConfig?.xAxisDisplay !== false
          ? { label: this.plotConfig?.xAxisLabel || labels?.x }
          : {}),
      },
      y: {
        ...(this.plotConfig?.yAxisDisplay !== false
          ? { label: this.plotConfig?.yAxisLabel || labels?.y }
          : {}),
      },
      ...(this.isServer ? { document: document } : {}),
    };
    // TODO: store as this.plot
    const plt = Plot.plot(plotConfig);
    plt.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    return plt;
  }
}
