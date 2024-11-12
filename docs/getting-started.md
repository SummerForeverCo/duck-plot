---
outline: deep
---

# Getting started

**In short:**

```javascript
// Import the library
import { DuckPlot } from "@summerforeverco/duck-plot";

// Create a new DuckPlot instance
new DuckPlot(ddb) // AsyncDuckDB instacne
  .table("tableName") // table in the database
  .x("xColumn") // x-axis column
  .y(["yColumn1", "yColumn2"]) // y-axis column(s) that will be unpivoted
  .color("colorColumn") // color column (or a color name)
  .mark("barY") // Observable Plot mark type
  .options({ width: 800, height: 600 }) // Observable Plot options
  .config({ percent: true }) // additional config options
  .render(); // render the plot
```

> [!CAUTION]
> Installation (⚠️ NPM not actually ready yet)

## Installation and loading

Install DuckPlot via npm:

```bash
npm install @summerforeverco/duck-plot
```

Then import the library in your project:

```javascript
import { DuckPlot } from "@summerforeverco/duck-plot";
```

## Creating a new DuckPlot instance

Pass in a DuckDB instance to create a new DuckPlot object. For server side
rendering, also include a JSDOM instance and an open-type font object

```javascript
const myPlot = new DuckPlot(
  ddb // AsyncDuckDB,
  { jsdom, font } // for server side rendering { jsdom: JSDOM; font?: opentype.Font }
)
```

## Configuring a plot

To configure a plot, you need to specify the table and the columns you wish to
visualize. You can use the following methods which correspond to each axis. See
the sections on [Specifying columns](/specifying-columns), [Options](/options),
and [Interactions]() for more details.

```javascript
myPlot
  .table("tableName") // table in the database
  .x("xColumn") // x-axis column
  .y(["yColumn1", "yColumn2"]) // y-axis column(s) that will be unpivoted
  .color("colorColumn") // color column (or a color name)
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
