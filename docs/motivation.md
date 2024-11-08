---
outline: deep
---

# Motivation

DuckPlot is an open-source JavaScript library that allows you to quickly generate charts with
[Observable Plot](https://github.com/observablehq/plot) when working with
[DuckDB](https://duckdb.org/).

Imagine you have this table of stock prices in a DuckDB database:

:::csv-preview
data/simpsons.csv
:::

You can use DuckPlot to generate this chart of the total High/low stock prices in 2018:

:::duckplot

```js
// Create a chart showing the sum of the high and low stock prices 2018
duckPlot
  .table("simpsons")
  .x("season")
  .y("us_viewers")
  .mark("barY", { stroke: "#f3f3f3" })
  .options({
    width: 600,
    height: 600,
    color: { scheme: "magma" },
  });
```

:::

:::duckplot

```js
// Create a chart showing the sum of the high and low stock prices 2018
duckPlot
  .table("athletes")
  .x("nationality")
  .y(["gold", "silver", "bronze"])
  .mark("barY", { sort: { x: "y", limit: 20, reverse: true } })
  .options({
    color: { range: ["gold", "silver", "#CD7F32"] },
  });
```

:::

This demonstrates the major features of the library:

- Performs **data transformations** and **aggregations** with DuckDB before
  rendering
- Automatically **adjusts the margins** and axis ticks labels for better
  readability
- Creates **custom interactive legends** for categorical data
- Supports both **client and server** environments
