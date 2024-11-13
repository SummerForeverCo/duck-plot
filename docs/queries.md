---
outline: deep
---

# Queries

In addition to the queries that DuckPlot will implicitly write and run for data
transformation and aggregation, you can provide a query string that will be run
_before_ the data is transformed and aggregated.

:::duckplot

```js
// Pre-query the data to filter for 2017
duckPlot
  .table("stocks_wide")
  .query(`SELECT * FROM stocks_wide WHERE year(Date) = 2017`)
  .x("Date")
  .y(["AAPL", "GOOG"])
  .config({ percent: true })
  .mark("barY");
```

:::

If you want to see the queries that DuckPlot is running, you can call the
`.queries()` method:

:::duckplot

```js
// Return the queries that DuckPlot will run
duckPlot
  .query(`SELECT * FROM stocks_wide WHERE year(Date) = 2017`)
  .table("stocks_wide")
  .x("Date")
  .y(["AAPL", "GOOG"])
  .config({ percent: true })
  .mark("barY")
  .queries();
```

:::

Similarly, you can call `.describe()` to get a high-level description of the
transformations applied.

:::duckplot

```js
// Describe the transformations applied
duckPlot
  .query(`SELECT * FROM stocks_wide WHERE year(Date) = 2017`)
  .table("stocks_wide")
  .x("Date")
  .y(["AAPL", "GOOG"])
  .config({ percent: true })
  .mark("barY")
  .describe();
```

:::
