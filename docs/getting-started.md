---
outline: deep
---

# Getting started

**In short:**

```javascript
// Import the library and the CSS
import { DuckPlot } from "@summerforeverco/duck-plot";
import "@summerforeverco/duck-plot/dist/style.css";

// Create a new DuckPlot instance
const chart = new DuckPlot(ddb); // AsyncDuckDB instacne

// Set the table and columns
chart
  .table("tableName") // table in the database
  .x("xColumn") // x-axis column
  .y(["yColumn1", "yColumn2"]) // y-axis column(s) that will be unpivoted
  .color("colorColumn"); // color column (or a color name)

// Set the mark type and options
chart
  .mark("barY") // Observable Plot mark type
  .options({ width: 800, height: 600 }) // Observable Plot options
  .config({ percent: true }); // additional config options

// Render the chart
chart.render(); // render the plot
```

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
the sections on [Configuring charts](/configuring-charts) for more details.

:::duckplot

```js
// Create an area chart of Amazon and Apple stock prices
duckPlot
  .table("stocks_wide") // table in the database
  .x("Date")
  .y(["AMZN", "AAPL"]) // multiple y columns
  .mark("areaY") // mark type
  .options({ x: { label: "Year" }, height: 250 }) // Observable Plot options
  .config({ percent: true }); // compute as percentage (in DuckDB)
```

:::

## Rendering a chart

To render a chart, just call the `.render()` method, noting that it's an asynchronous operation.

```javascript
myPlot.render();
```
