# DuckPlot 🦆📈

DuckPlot is a JavaScript library that allows you to quickly generate charts with
[Observable Plot](https://github.com/observablehq/plot) when working with [DuckDB](https://duckdb.org/). It allows you to easily configure, prepare, and visualize your data, whether
you are running in a Node.js environment or in the browser.

## Features

- Performs data transformations and aggregations with DuckDB before plotting
- Uses a method chaining API for easy configuration
- Leverages Observable Plot for robust and customizable data visualizations
- Supports both server and client environments

## Installation

You can install DuckPlot via npm:

```bash
npm install duck-plot
```

## Usage

### Basic Example

Here’s a basic example of how to use DuckPlot to create a line plot.

```javascript
import { DuckPlot } from "duck-plot";
// Assumes you have a DuckDB instance named `db` and a table named `my_table`
const duckPlot = new DuckPlot();
duckPlot
  .data({ ddb: db, table: "my_table" })
  .columns({ x: "date", y: "cost", series: "company", facet: "department" })
  .type("line");
const svg = await duckPlot.plot();
document.body.appendChild(svg);
```

### API

#### `data(config: DataConfig): this`

Sets the DuckDB instance and table name.

- `config`: `{ ddb: AsyncDuckDB, table: string }`

#### `columns(config: ColumnsConfig): this`

Sets the columns of interest for the plot.

- `config`: `{ x: string, y: string, series: string, facet?: string }`

#### `x(value?: string): string | this`

Gets or sets the x-axis column.

- `value`: `string` (optional)

#### `y(value?: string): string | this`

Gets or sets the y-axis column.

- `value`: `string` (optional)

#### `series(value?: string): string | this`

Gets or sets the series column.

- `value`: `string` (optional)

#### `type(value?: ChartType): ChartType | this`

Gets or sets the plot type.

- `value`: `"line" | "bar" | "dot" | "areaY" | "barX" | "barY"` (optional)

#### `config(config: PlotConfig): this`

Sets the configuration for the plot.

- `config`: `{ xAxisLabel?: string, yAxisLabel?: string, height?: number, width?: number, xAxisDisplay?: boolean, yAxisDisplay?: boolean, titleDisplay?: boolean }`

#### `plot(): Promise<SVGSVGElement | HTMLElement | null>`

Prepares and generates the plot. Returns an SVG element or an HTMLElement depending on the environment.

### Conditional Server and Client Code

To handle both server and client environments, check for the presence of `window` to distinguish between Node.js and browser environments:

```javascript
const isServer = typeof window === "undefined";

if (isServer) {
  const fs = require("fs");
  await fs.promises.writeFile("plot.svg", svg.outerHTML, "utf8");
  console.log("SVG file has been saved.");
} else {
  document.body.appendChild(svg);
}
```

## Data Transformations

## Development

After making changes to any `src/` files, run `npm run build` to compile the
TypeScript code and view your examples:

- To view examples in the browser, run `npm run dev` and open `http://localhost:8008/`
- To view examples in the server, run `npm run dev-server` and view
  the outputted `.svg` files in `examples/server-output`

Examples can be easily added to the `examples/` directory (and need to be
exported by the `examples/plots/index.js` file) to test new features. For
example, here is the [line chart](examples/plots/line.js) example:

```javascript
import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `
duckplot
  .data({ ddb: db, table: "income" })
  .columns({ x: "month", y: "consensus_income"})
  .type("line")
`;

export const line = (duckplot) =>
  renderPlot(duckplot, "income.csv", codeString);
```

## Implementation

Because DuckDB has different APIs for
[WASM](https://duckdb.org/docs/api/wasm/overview.html) and [Node.js](https://duckdb.org/docs/api/nodejs/overview), DuckPlot uses a conditional import to load the appropriate DuckDB API based on the environment.

```javascript

## License

This project is licensed under the MIT License.

---

By following this README, you should be able to quickly get started with DuckPlot and create powerful visualizations from your DuckDB data. If you encounter any issues or have any questions, feel free to open an issue on GitHub.
```
