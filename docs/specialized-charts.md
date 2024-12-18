---
outline: deep
---

# Specialized charts

There are a handful of charts that are unique to DuckPlot (or a bit tricky to
specify, so it's worth describing them).

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
  .mark("rectY");
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
// Specify multiple y columns and an fx column
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

To create a chart with multiple marks, you can pass an array of marks to `.options()`

:::duckplot

```js
duckPlot
  .table("stocks")
  .x("Date")
  .y("High")
  .color("Symbol")
  .mark("line")
  .options({ marks: [Plot.ruleY([1000], { stroke: "red" })] });
```

:::

This example is obviously contrived, but it demonstrates how you can pass
additional marks to the plot.

## Hierarchical visualizations (limited support)

There is currently limited support for both treemaps and circle pack charts in DuckPlot. You can specify a
single column for the size (`y`), color (`color`), and text label (`text`).
Aggregation is supported, in that each group will be aggregated (e.g., to each
`color` or `text` category). The proportion represented by each group is
displayed in the tooltip. Note, legend filtering works as expected, and the
displayed proportion will update accordingly.

Implementation is based on [this notebook](https://observablehq.com/@ee2dev/making-a-treemap-and-sankey-diagram-with-observable-plot).

:::duckplot

```js
// Aggregate by color
// Treemap of closing price aggregated by symbol
duckPlot.table("stocks").y("Close").color("Symbol").mark("treemap");
```

:::

:::duckplot

```js
// No aggregation
// Circle pack of the last 30 days closing price
duckPlot
  .query(`select * from stocks ORDER BY Date DESC LIMIT 30`)
  .table("stocks")
  .y("Close")
  .mark("treemap");
```

:::

:::duckplot

```js
// Aggregate by color and text
// CirclePack of closing price aggregated by symbol and month
duckPlot
  .query(
    `select month(Date) as Month, Symbol, sum(Close) as Close
          from stocks
          where year(Date) = 2017
          group by month(Date), Symbol`
  )
  .table("stocks")
  .y("Close")
  .color("Symbol")
  .mark("circlePack")
  .text("Month");
```

:::

:::duckplot

```js
// Continuous legend
// Circle pack of the last 100 highest closing prices
duckPlot
  .query(`select * from stocks ORDER BY Close DESC LIMIT 100`)
  .table("stocks")
  .y("Close")
  .color("Close")
  .mark("treemap");
```

:::

## Partial charts

If a chart is only partially specified (e.g., missing an `x` or `y` column),
DuckPlot will render a partial chart, which is to say the specified axes and legend
without any marks.

:::duckplot

```js
duckPlot.table("stocks").x("Date").color("Symbol").mark("barY");
```

:::
