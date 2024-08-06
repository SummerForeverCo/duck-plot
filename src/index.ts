// TODO: maybe I only need this in DEV if the user is passing in a ddb instance..?
import type { AsyncDuckDB } from "@duckdb/duckdb-wasm";
import type { Table as Arrow } from "@apache-arrow/ts";

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

// TODO: db type
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
    // Ensure the connection is closed even if an error occurs
    await conn.close();
  }
};

export class DuckPlot {
  private dataConfig: DataConfig | null = null;
  private columnsConfig: ColumnsConfig | null = null;
  private plotType: string | null = null;
  private plotConfig: PlotConfig | null = null;
  private conn: any;

  // Method overloads for data
  data(): DataConfig;
  data(config: DataConfig): this;
  data(config?: DataConfig): DataConfig | this {
    if (config) {
      this.dataConfig = config;
      this.conn = this.dataConfig.ddb.connect();
      return this;
    }
    return this.dataConfig!;
  }

  // Method overloads for columns
  columns(): ColumnsConfig;
  columns(config: ColumnsConfig): this;
  columns(config?: ColumnsConfig): ColumnsConfig | this {
    if (config) {
      this.columnsConfig = config;
      return this;
    }
    return this.columnsConfig!;
  }

  // Method overloads for x
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

  // Method overloads for y
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

  // Method overloads for series
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

  // Method overloads for type
  // TODO: chart type
  type(): string;
  type(value: string): this;
  type(value?: string): string | this {
    if (value) {
      this.plotType = value;
      return this;
    }
    return this.plotType!;
  }

  // Method overloads for config
  // TODO default config
  config(): PlotConfig;
  config(config: PlotConfig): this;
  config(config?: PlotConfig): PlotConfig | this {
    if (config) {
      this.plotConfig = config;
      return this;
    }
    return this.plotConfig!;
  }

  // TODO: return an array regardless of web or server
  prepareChartData(): Promise<any[]> | null {
    if (!this.dataConfig) return null;
    return runQueryServer(
      this.dataConfig?.ddb,
      `select * from ${this.dataConfig?.table}`
    );
  }

  async plot(): Promise<void> {
    const chartData = await this.prepareChartData();
  }
}
