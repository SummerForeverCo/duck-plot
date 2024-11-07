---
outline: deep
---

# Motivation

DuckPlot is an open-source JavaScript library that allows you to quickly generate charts with
[Observable Plot](https://github.com/observablehq/plot) when working with
[DuckDB](https://duckdb.org/).

Imagine you have this table of stock prices in a DuckDB database:

| Symbol | Date       | Open    | High    | Low     | Close   |
| ------ | ---------- | ------- | ------- | ------- | ------- |
| AAPL   | 2013-05-13 | 64.5014 | 65.4143 | 64.5    | 64.9629 |
| AAPL   | 2013-05-14 | 64.8357 | 65.0286 | 63.1643 | 63.4086 |
| AAPL   | 2013-05-15 | 62.7371 | 63      | 60.3371 | 61.2643 |
| AAPL   | 2013-05-16 | 60.4629 | 62.55   | 59.8429 | 62.0829 |
| AAPL   | 2013-05-17 | 62.7214 | 62.87   | 61.5729 | 61.8943 |

You can use DuckPlot to generate this chart of the total High/low stock prices in 2018:

:::duckplot

```js-vue
// Create a chart showing the sum of the high and low stock prices 2018
duckPlot
  .table("stocks")
  .query("SELECT * from stocks where year(Date) = 2018")
  .x("Date")
  .y(["High", "Low"])
  .mark("line");
```

:::

This demonstrates the major features of the library:

- Performs **data transformations** and **aggregations** with DuckDB before
  rendering
- Automatically **adjusts the margins** and axis ticks labels for better
  readability
- Creates **custom interactive legends** for categorical data
- Supports both **client and server** environments
