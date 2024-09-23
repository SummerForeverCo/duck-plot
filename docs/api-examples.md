---
outline: deep
---

# Getting started

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

:::duckplot

```js-vue
duckPlot
  .table("taxi")
  .x("date")
  .color("Borough")
  .y("count")
  .mark("line");
```

:::

:::duckplot

```js-vue
duckPlot
  .table("taxi")
  .x("Borough")
  .color("Borough")
  .y("count")
  .mark("dot");
```

:::

This demonstrates the major features of the library:

- Performs **data transformations** and **aggregations** with DuckDB before
  rendering
- Automatically **adjusts the margins** and axis ticks labels for better
  readability
- Creates **custom legends** for categorical data
- Supports both **client and server** environments
