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

- you can optionally pass in corresponding plot options for the axis
- we're using `color` to handle fill or stroke (`line`, `rule`, and `tick` marks
  use stoke, all others use fill)
- All methods are **getter**/**setter** methods, meaning they can be used to
  both set and get the values. For example, you can use the `.x("colName")` method to set
  the x-axis column and the `.x()` method without any parameters to get the
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

## Selecting a mark

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
