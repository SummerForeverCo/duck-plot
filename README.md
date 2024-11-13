# DuckPlot 🦆📈

DuckPlot is an open-source JavaScript library that allows you to quickly generate charts with
[Observable Plot](https://github.com/observablehq/plot) when working with
[DuckDB](https://duckdb.org/).

## Disclaimer

This library is actively being developed, and does not fully support all
Observable Plot features. However, we believe it's helpful for many common use
cases and are actively adding feature support (see [Contrubuting](#Contributing)).

## Documentation

See the [documentation](https://summerforeverco.github.io/duck-plot/) for more information.

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
const codeString = `// Standard line chart
duckplot
  .table("stocks")
  .x("Date")
  .y("Open")
  .color("Symbol")
  .mark("line")
`;

export const line = (options) => renderPlot("stocks.csv", codeString, options);
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

Feel free to open a pull request or file an issue if you have any suggestions or would
like to contribute to the project. We are actively working on adding more
features and improving the library. However, we are a small team and are
actively using this library in our production software, so we may not be able to
merge all pull requests.

## License

This project is licensed under the MIT License.
