---
outline: deep
---

# Configuring charts

## Selecting a table

A DuckPlot instance is created by passing in a DuckDB instance. You can then
indicate the table you wish to visualize using the `.table()` method.

```javascript
const myPlot = new DuckPlot(ddb).table("tableName");
```

## Specifying columns

To specify the columns you wish to display, use the following methods which
correspond to each visual encoding (e.g., axis).

- `.x(column?: string | string[], options?: PlotOptions["x"])`
- `.y(column?: | string[], options?: PlotOptions["y"])`
- `.color(column?: string | string[], options?: PlotOptions["color"])`
- `.fy(column?: string, options?: PlotOptions["fx"])`
- `.fx(column?: string | string[], options?: PlotOptions["fx"])`
- `.r(column?: string | string[])`
- `.text(column?: string | string[])`

Of note:

- you can optionally pass in corresponding plot options for each visual encoding
- `color` is used to handle fill or stroke: `line`, `rule`, and `tick` marks
  use stoke, all others use fill
- All methods are **getter**/**setter** methods, meaning they can be used to
  both set and get the values. For example, you can use the `.x("colName")` method to set
  the x-axis column and the `.x()` method without any parameters to return the
  current axis and options.

:::duckplot

```js
// Example column selection
duckPlot
  .query(`SELECT * FROM stocks`)
  .table("stocks")
  .x("Date")
  .y(["High", "Low"])
  .fy("Symbol")
  .mark("line");
```

:::

## Setting the mark type

The `.mark()` method is used to specify the Observable Plot mark type. The `dot`
mark type also accepts a `r` column option.

:::duckplot

```js
// Example column selection
duckPlot
  .query(`SELECT * FROM stocks`)
  .table("stocks")
  .x("Date")
  .y("High")
  .fy("Symbol")
  .r("High")
  .mark("dot");
```

:::

We could alternatively use a `tick` mark with a color encoding to display the data:
:::duckplot

```js
// Example column selection
duckPlot
  .query(`SELECT * FROM stocks`)
  .table("stocks")
  .x("Date")
  .color("High")
  .fy("Symbol")
  .mark("tickX");
```

:::

## Options

There are two ways to specify the options for a plot. You can pass in a second
(optional) argument for each column specified (e.g., `.x()`, .`y()`, etc.) or
you can call the `.options()` method to set the options for the entire plot
(equivalent to `Plot.plot({...options})`).

:::duckplot

```js
duckPlot
  .query("select * from stocks where year(Date) = 2017")
  .table("stocks")
  .x("Date", { label: "Custom X Label" }) // Same as options.x
  .y("Close")
  .mark("barY", { stroke: "black", opacity: 0.5 }) // additional options for the mark
  .color("Date")
  .options({
    height: 200,
    width: 500,
    y: {
      domain: [0, 3500],
      labelArrow: "none",
      tickFormat: "2s",
    },
    x: { ticks: [] },
    color: { legend: false },
  });
```

:::

## Additional configurations

These options are a bit awkward, not fitting in anywhere else very cleanly.

```javascript
xLabelDisplay?: boolean; // Display axis labels, default true
yLabelDisplay?: boolean; // Display axis labels, default true
tip?: boolean; // Show tooltips, default true
// For use in the tooltip
tipLabels?: {
  x?: string;
  y?: string;
  color?: string;
};
tipValues?: {
  x?: (d: Indexable, i: number) => string;
  y?: (d: Indexable, i: number) => string;
  color?: (d: Indexable, i: number) => string;
};
autoMargin?: boolean; // Automatically adjust margins, default true
aggregate?: "sum" | "avg" .... // DuckDB supported aggregation type
interactiveLegend?: boolean; // Make legend interactive, default true
percent?: boolean; // for percent stacked charts, default false

```

:::duckplot

```js
duckPlot
  .table("stocks")
  .x("Date")
  .y("Open")
  .color("Symbol")
  .mark("areaY")
  .config({
    // Useful for hiding the label but keeping it in the tooltip
    xLabelDisplay: false,
    tipLabels: {
      x: "This really long value will get truncated",
    },
    tipValues: {
      y: (d) => d.y.toFixed(1),
    },
    autoMargin: false,
    interactiveLegend: false,
    percent: true,
    // aggregate - not shown
  });
```
