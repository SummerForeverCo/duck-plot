---
outline: deep
---

# Using raw data

DuckPlot can also be used to plot data that is not stored in a database. You can
provide an array of objects as the data source, and specify the data types of
each column. DuckPlot will use the specified columns to extract the values from
the array, but will not perform any data transformations or aggregations.

:::duckplot

```js
// Sample data and types
const data = [
  { col1: "a", col2: 5 },
  { col1: "b", col2: 2 },
  { col1: "c", col2: 3 },
];
const types = { col1: "string", col2: "number" };

// Use raw data instead of a database and table
duckPlot
  .rawData(data, types)
  .x("col1")
  .y("col2")
  .color("col1")
  .fy("col1")
  .mark("barY");
```

:::
