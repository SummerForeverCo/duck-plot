import type { AsyncDuckDB } from "@duckdb/duckdb-wasm";
import * as Plot from "@observablehq/plot";
import { JSDOM } from "jsdom";

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

type MarkType = "dot" | "areaY" | "line" | "barX" | "barY";

export const runQueryServer = async (db: any, sql: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, (err: string, res: any[]) => {
      if (err) {
        console.warn(err);
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

export const runQueryClient = async (
  db: AsyncDuckDB,
  sql: string
): Promise<any[]> => {
  const conn = await db.connect();
  try {
    const arrow = await conn.query(sql);
    return arrow.toArray();
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  } finally {
    await conn.close();
  }
};

export class DuckPlot {
  private dataConfig: DataConfig | null = null;
  private columnsConfig: ColumnsConfig | null = null;
  private plotType: MarkType | null = null;
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

  type(): MarkType;
  type(value: MarkType): this;
  type(value?: MarkType): MarkType | this {
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

  async prepareChartData(): Promise<any[]> {
    if (!this.dataConfig) throw new Error("Data configuration is not set");
    const runner = this.isServer ? runQueryServer : runQueryClient;

    return runner(
      this.dataConfig.ddb,
      `SELECT * FROM ${this.dataConfig.table}`
    );
  }

  async plot(): Promise<SVGSVGElement | HTMLElement | null> {
    if (!this.plotType) return null;
    const chartData = await this.prepareChartData();
    const document = this.isServer ? this.jsdom!.window.document : undefined;

    const plotConfig = {
      marks: [
        Plot[this.plotType](chartData, {
          x: this.columnsConfig!.x,
          y: this.columnsConfig!.y,
          stroke: this.columnsConfig!.series,
        }),
      ],
      ...(this.isServer ? { document: document } : {}),
    };
    // TODO: store as this.plot
    const plt = Plot.plot(plotConfig);
    plt.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    return plt;
  }
}
