# DuckPlot 🦆📈

DuckPlot is a JavaScript library that allows you to quickly generate charts with
[Observable Plot](https://github.com/observablehq/plot) when working with
[DuckDB](https://duckdb.org/).

## Disclaimer

This library is actively being developed, and does not fully support all
Observable Plot features. However, we believe it's helpful for many common use
cases and are actively adding feature support (see [Contrubuting](#Contributing)).

## Motivation

Imagine you have this table of taxi rides in your DuckDB instance:

| Date       | Count | Borough       |
| ---------- | ----- | ------------- |
| 2023-01-01 | 1     | Bronx         |
| 2023-01-01 | 4     | Manhattan     |
| 2022-12-31 | 144   | Bronx         |
| 2022-12-31 | 691   | Brooklyn      |
| 2022-12-31 | 9     | EWR           |
| 2022-12-31 | 74415 | Manhattan     |
| 2022-12-31 | 8512  | Queens        |
| 2022-12-31 | 12    | Staten Island |
| 2022-12-31 | 1292  | Unknown       |
| 2022-12-30 | 148   | Bronx         |

To generate this chart of the number of taxi rides per borough, you can use
DuckPlot:

<div style="display: flex; align-items: flex-start; flex-wrap: no-wrap;">
  <img src="public/bar.png" alt="Bar chart of taxi rides by borough" width="300px"/>
  <pre style="margin-left: 10px;">
<code>
duckplot
  .table("taxi")
  .x("Borough") // X-axis
  .y("Count") // Y-axis
  .series("Borough") // Series  
  .mark("barY") // Observable Plot mark type
  .render(); // Generate the plot
</code>
  </pre>
</div>

This demonstrates the major features of the library:

- Performs **data transformations** and **aggregations** with DuckDB before
  rendering
- Automatically **adjusts the margins** and axis ticks labels for better
  readability
- Creates **custom legends** for categorical data
- Supports both **client and server** environments

## Installation (⚠️ NPM build not actually ready yet)

You can install DuckPlot via npm:

```bash
npm install duck-plot
```

## Usage

### DuckPlot Class Methods

**Constructor Arguments:**
Pass in an DuckDB instance to the class, and optionally a JSDOM instance and a
font object for server-side rendering.

```javascript
constructor(
  ddb: AsyncDuckDB,
  { jsdom, font }: { jsdom?: JSDOM; font?: any } = {}
)
```

- **`ddb: AsyncDuckDB`** The DuckDB instance to be used for querying and data manipulation.
- **`{ jsdom, font }: { jsdom?: JSDOM; font?: any }`**An optional configuration object
  - **`jsdom` _(optional)_**: An instance of JSDOM for creating a simulated DOM environment when running on the server.
  - **`font` _(optional)_**: An opentype.js loaded font object used for
    measuring text length on the server

**`.table(string?)`**: The name of the table to be used for plotting.

To specify the columns you wish to visualize, use the following methods which
correspond to each axis.

**`.x(column?: string, options?: PlotOptions["x"])`**
**`.y(column?: string, options?: PlotOptions["y"])`**
**`.fx(column?: string, options?: PlotOptions["fx"])`**
**`.fy(column?: string, options?: PlotOptions["fx"])`**
**`.color(column?: string, options?: PlotOptions["color"])`**

Of note:

- you can optionally pass in corresponding plot options for the axis
- we're using `color` to handle fill or stroke (`line`, `rule`, and `tick` marks
  use stoke, all others use fill)
- All methods are **getter**/**setter** methods, meaning they can be used to
  both set and get the values. For example, you can use the `.x("colName")` method to set
  the x-axis column and the `.x()` method without any parameters to get the
  current axis and options.

**`.mark("line" | "barY" | "areaY" | "dot" | "barX")`** Sets the type of plot. Options correspond to Observable Plot mark types.

These options are a bit awkward, not fitting in anywhere else very cleanly.

**`.configConfig(
  xLabelDisplay?: boolean; // Display axis labels
  yLabelDisplay?: boolean; // Display axis labels
  tip?: boolean; // Show tooltips
  autoMargin?: boolean; // Automatically adjust margins, default is true
  aggregate?: | "sum"
  | "avg"
  | "count"
  | "max"
  | "min"
  | "median"
  | "mode"
  | "stddev"
  | "variance";
)`**

**`.render()`** Prepares the data and generates the plot (async method)

**`.query(string)`**: Run a custom query on the DuckDB instance _before_ data
transformations are performed.

## Data Transformations

Depending on the mark type and columns, DuckPlot will perform the necessary data
transformations and aggregations. This happens in three steps:

- **Query**: If a custom query is provided, it will be run on the DuckDB
  instance
- **Pivoting**: If multiple y or x columns are provided, the data will be
  pivoted to create a single `x`, `y`, and `series` column.
- **Aggregations**: If an aggregation is specified, the data will be aggregated
  based on the `x`, `y`, and `series` columns. Data will also be automatically
  aggregated for certain mark types (`barY`, `barX`, `areaY`, `line`).
  Specifically, it will check to see if the data is distinct by the specified
  columns, and if not, it will perform a `sum` aggregation.

Does this seem like too much of a black box? You can inspect the data
transformations by calling these methods:

- `.describe()`: Get a description of the data transformations
- `.queries()`: Get the full query strings taht were run for each step above.

## Development

To locally develop DuckPlot, clone the repository and install the dependencies
with `npm install`.

- To view examples in the browser, run `npm run dev` and open `http://localhost:8008/`
- To view examples in the server, run `npm run dev-server` and view
  the outputted `.html` files in `examples/server-output`
- For an example creating multiple plots from a single data source, run `npm run
dev-multi-chart`, and see the outputted files in `examples/server-output`

Examples can be easily added to the `examples/` directory (and need to be
exported by the `examples/plots/index.js` file) to test new features. For
example, here is the [line chart](examples/plots/line.js) example:

```javascript
import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `
duckplot
  .table("income")
  .query("SELECT * FROM income LIMIT 100")
  .x("month", {label: "Date", axis: "top", grid: true})
  .y("consensus_income", {type: "log"})
  .mark("line")
  .color("red")
  .options({width: 400, height: 500, y: {domain: [100, 30000]}})
`;

export const line = (duckplot) =>
  renderPlot(duckplot, "income.csv", codeString);
```

If you're actively developing DuckPlot, you can run `npm run watch:build` to watch for changes in the `src/` directory and automatically recompile the TypeScript code.

## Testing

Run `npm run test` to test

## Implementation notes

Because DuckDB has different APIs for
[WASM](https://duckdb.org/docs/api/wasm/overview.html) and [Node.js](https://duckdb.org/docs/api/nodejs/overview), DuckPlot uses a conditional import to load the appropriate DuckDB API based on the environment.

Performing axis adjustments on the server requires measuring the text width of
the axis labels. This is done using `opentype.js`. You can pass in your own font
for more precise measurements.

## Contributing

Feel free to open a pull request or issue if you have any suggestions or would
like to contribute to the project. We are actively working on adding more
features and improving the library. However, we are a small team and are
actively using this library in our production software, so we may not be able to
merge all pull requests.

## License

This project is licensed under the MIT License.
