---
outline: deep
---

# Getting started

**tl:dr**

```javascript
import { DuckPlot } from "@summerforeverco/duck-plot";
new DuckPlot(ddb)
  .table("tableName")
  .x("x")
  .y(["y1", "y2"])
  .color("colorColumn")
  .mark("barY")
  .options({ width: 800, height: 600 })
  .config({ percent: true })
  .render();
```

> [!CAUTION]
> Installation (⚠️ NPM not actually ready yet)

## Installation and loading

You can install DuckPlot via npm:

```bash
npm install @summerforeverco/duck-plot
```

Then, you can import the library in your project:

```javascript
import { DuckPlot } from "@summerforeverco/duck-plot";
```

## Creating a new DuckPlot instance

Pass in an DuckDB instance to the class, and optionally a JSDOM instance and a
font object for server-side rendering.

```javascript
const myPlot = new DuckPlot(
  ddb // AsyncDuckDB,
  { jsdom, font } // for server side rendering { jsdom?: JSDOM; font?: opentype.Font }
)
```

## Configuring a plot

To configure a plot, you need to specify the table and the columns you wish to
visualize. You can use the following methods which correspond to each axis. See
the sections on [Specifying columns](/specifying-columns), [Options](/options),
and [Interactions]() for more details.

```javascript
myPlot
  .table("tableName")
  .x("x")
  .y(["y1", "y2"])
  .color("colorColumn")
  .mark("barY") // Observable Plot mark type
  .options({
    // Observable Plot options
    width: 800,
    height: 600,
  })
  .config({
    percent: true, // for a percentage bar chart
  });
```

## Rendering a chart

To render a chart, just call the `.render()` method, noting that it's an asynchronous operation.

```javascript
myPlot.render();
```
