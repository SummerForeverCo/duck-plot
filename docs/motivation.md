---
outline: deep
---

# Motivation

DuckPlot is an open-source JavaScript library that allows you to quickly generate charts with
[Observable Plot](https://github.com/observablehq/plot) when working with
[DuckDB](https://duckdb.org/).

Imagine you have this table of athletes and medals won in a DuckDB database:

<CSVPreview fileName="data/athletes.csv" :columns="['name', 'nationality', 'gold', 'silver', 'bronze']" />

If you want to know the **number of medals by nationality**, you can use
DuckPlot to transform and aggregate your data as part of declaring and rendering your chart:

:::duckplot

```js
// Create a chart showing the sum of the medals by nationality
duckPlot
  .table("athletes")
  .x("nationality")
  .y(["gold", "silver", "bronze"]) // UNPIVOT these!
  .mark("barY", { sort: { x: "y", limit: 20, reverse: true } })
  .options({
    color: { range: ["gold", "silver", "#CD7F32"] },
  });
```

:::

This demonstrates the major features of the library:

- Performs **data transformations** based on the specified columns, allowing you
  to **unpivot** the data
- **Aggregates data** at the database layer with DuckDB before rendering
- Automatically **adjusts the margins** and axis ticks labels for better
  readability
- Creates **custom interactive legends** for both categorical and continuous data
- Supports both **client and server** environments
