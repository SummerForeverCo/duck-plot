---
outline: deep
---

# Legends

DuckPlot color legends are interactive by default. The legends allow you to
explor the data by temporarily filtering down the data to the selected range
(continuous data) or categories (categorical data).

## Continuous legends

Brushing on the legend will filter down the data to the selected range. Clicking on the legend will clear
the brush.

:::duckplot

```js
// Click on the legend to toggle visibility
duckPlot
  .table("stocks")
  .x("Date")
  .y("High")
  .color("Date")
  .mark("barY")
  .fy("Symbol")
  .options({ height: 400 });
```

:::

## Categorical legends

By default, categorical legends are interactive. Clicking on a legend item will
toggle the visibility of that item in the chart. If you hold the `Shift` key and
click on a legend item, all other items will be hidden. If only one item is
visible and you click it, all items will be shown.

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
