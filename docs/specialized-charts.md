---
outline: deep
---

# Specialized charts

There are a handful of charts that are unique to DuckPlot (or worth noting how
to create them).

## Partial charts

If a chart is only partially specified (e.g., missing an `x` or `y` column),
DuckPlot will render a partial chart, which is to say the axes and legend
without any marks.

:::duckplot

```js
duckPlot.table("stocks").x("Date").color("Symbol").mark("barY");
```

:::

## Percentage charts

DuckPlot handles percentage computations at the database level. To create a
stacked chart by percentage, set `.config({ percent: true })`.

:::duckplot

```js
// Pecentage stacked bar chart
duckPlot
  .table("stocks_wide")
  .x("Date")
  .y(["GOOG", "AMZN", "IBM", "AAPL"])
  .config({ percent: true })
  .mark("barY");
```

:::

:::duckplot

```js
// Pecentage stacked area chart
duckPlot
  .table("stocks_wide")
  .x("Date")
  .y(["GOOG", "AMZN", "IBM", "AAPL"])
  .config({ percent: true })
  .mark("areaY");
```

:::

## Grouped bar charts

Based on [this
example](https://observablehq.com/@observablehq/plot-grouped-bar-chart), a
grouped bar chart leverages faceting in the horizontal (`fx`) direction. There
are a few ways you can create a grouped bar chart, either by specifying multiple
y columns, a color column, or both!

:::duckplot

```js
// Specify multiple y column and an fx column
duckPlot
  .query(
    "select * from stocks_wide where year(Date) = 2017 AND month(Date) = 1"
  )
  .table("stocks_wide")
  .fx("Date")
  .y(["AAPL", "GOOG"])
  .mark("barY");
```

:::

:::duckplot

```js
// Specify a y column, a color column, and an fx column
duckPlot
  .query("select * from stocks where year(Date) = 2017 AND month(Date) = 1")
  .table("stocks")
  .fx("Date")
  .y("Open")
  .x("Symbol") // make sure to specify the x column
  .color("Symbol")
  .mark("barY");
```

:::

:::duckplot

```js
// Specify multiple y columns, a color column, and an fx column
duckPlot
  .query("select * from stocks where year(Date) = 2017 AND month(Date) = 1 ")
  .table("stocks")
  .fx("Date")
  .y(["Low", "High"])
  .color("Symbol")
  .mark("barY");
```

:::

## Multiple marks

To create a chart with multiple marks, you can pass an array of marks to the `.options()`

:::duckplot

```js
duckPlot
  .table("stocks")
  .x("Date")
  .y("High")
  .color("Symbol")
  .mark("line")
  .options({ marks: [Plot.ruleY([1000])] });
```

:::

This example is obviously contrived, but it demonstrates how you can pass
additional marks to the plot.
