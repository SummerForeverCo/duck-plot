---
outline: deep
---

# Using color

There are a few ways to use color in DuckPlot. You can use the `.color()`
method to specify a column to use for color encoding. You can also use the
`.color()` method to specify a color value directly.

## Color encoding

Pass a column name to the `.color()` method to use that column for color.

:::duckplot

```js
duckPlot.table("stocks").x("Date").y("Open").color("Symbol").mark("areaY");
```

:::

## Color as value

If you want all marks to have the same color, pass a color value to the
`.color()` method. DuckPlot uses the same `isColor` method as [Observable
Plot](https://github.com/observablehq/plot/blob/700c6eef9c179fa5bef6bf2a4d5b6a74591d8951/src/options.js#L523)
to detect valid CSS color values.

:::duckplot

```js
duckPlot.table("stocks").x("Date").y("Open").color("hotpink").mark("areaY");
```

:::

## Setting the domain and range

If you want to set the domain and range for the color scale, you can set them in
the `.options()` method.

:::duckplot

```js
duckPlot
  .table("stocks")
  .x("Date")
  .y("Open")
  .color("Symbol")
  .mark("areaY")
  .options({
    color: {
      domain: ["AAPL", "GOOG", "IBM", "AMZN"],
      range: ["red", "green", "blue", "purple"],
    },
  });
```

:::

## Using a scheme

Because options are passed directly into Plot, you can use any of the color
schemes available for categorical or continuous data.

:::duckplot

```js
duckPlot
  .table("stocks")
  .x("Date")
  .y("Open")
  .color("Symbol")
  .mark("areaY")
  .options({ color: { scheme: "category10" } });
```

:::

Also works for a continuous color scale:

:::duckplot

```js
duckPlot
  .table("stocks")
  .x("Date")
  .y("Open")
  .color("Open")
  .mark("dot")
  .fy("Symbol")
  .options({ color: { scheme: "reds" } });
```

:::
