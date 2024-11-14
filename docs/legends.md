---
outline: deep
---

# Legends

By default, categorical legends are interactive. Clicking on a legend item will
toggle the visibility of that item in the chart. If you hold the `Shift` key and
click on a legend item, all other items will be hidden.

:::duckplot

```js
// Click on the legend to toggle visibility
duckPlot
  .table("stocks")
  .x("Date")
  .y(["High", "Low"])
  .color("Symbol")
  .mark("line");
```

:::

If you don't want the legend to be interactive, set `.config({
interactiveLegend: false})`.

:::duckplot

```js
// Turn off the interactive legend
duckPlot
  .table("stocks")
  .x("Date")
  .y(["High", "Low"])
  .color("Symbol")
  .mark("line")
  .config({
    interactiveLegend: false,
  });
```

:::
