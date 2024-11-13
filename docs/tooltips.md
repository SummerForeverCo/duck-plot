---
outline: deep
---

# Tooltips

Tooltips are included by default in DuckPlot. If you want to disable them, set
`.config({ tooltip: false })`. You can also customize the tooltip labels and
values by setting `.config({tipValues: {...}, tipLabels: {...}})`.

:::duckplot

```js
// Set the tips labels and values
duckPlot
  .table("stocks")
  .x("Date")
  .y("Open")
  .color("Symbol")
  .mark("areaY")
  .config({
    // All labels are truncated at 25 characters
    tipLabels: {
      x: "This really long value will get truncated",
    },
    tipValues: {
      y: (d) => d.y.toFixed(1),
    },
  });
```

:::
