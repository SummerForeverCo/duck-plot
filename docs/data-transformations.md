---
outline: deep
---

# Data transformations

## Philosophy

A central problem behind data visualization is the need to transform your data
to a target structure. DuckPlot aims to solve this problem by allowing users to
target the same visualizaiton with different data structures. Let's take a long
and wide view of the same sales data ([souce](https://github.com/uwdata/mosaic/blob/main/data/stocks.csv)):

<div style="display: flex; gap: 10px;">
<div>

**Long view**
<CSVPreview fileName="data/stocks.csv" :columns="['Symbol', 'Date', 'Open']" />

</div>
<div>

**Wide view**
<CSVPreview fileName="data/stocks_wide.csv" :columns="['Date', 'AAPL',	'AMZN']" />

</div>
</div>

Because Observable Plot marks [expect Tidy
Data](https://observablehq.com/plot/features/marks#marks-have-tidy-data),
DuckPlot performs a data transformation based on the specified columns of
interest.

DuckPlot allows you to work with the wide view by automatically transforming
the data to a long structure. In doing so, it will always transform the input
data to a long structure with generic column names:

| x          | y       | color |
| ---------- | ------- | ----- |
| 2013-05-13 | 64.5014 | AAPL  |
| 2013-05-14 | 64.8357 | AAPL  |
| 2013-05-15 | 62.7371 | AAPL  |
| 2013-05-16 | 60.4629 | AAPL  |

## Multiple Y Columns

Specified Y columns will be **unpivoted** to create two columns: `y`, and `color`,
where the `y` column holds the value, and the `color` holds the name of the unpivoted
columns.

:::duckplot

```js
// Use wide data to show the AAPL and GOOG stock prices
duckPlot
  .table("stocks_wide")
  .x("Date")
  .y(["AAPL", "GOOG"]) // These become the values in the color column
  .mark("line");
```

:::

## Multiple color columns

Color columns will be **concatenated** into a new column

Given a long data structure where the metric is also stored in the column,
you can specify each Symbol-metric pair as the desired color.

**Input data**
<CSVPreview fileName="data/stocks_long.csv"  />

:::duckplot

```js
// Use long data to show the high and low prices for each stock
duckPlot
  .table("stocks_long")
  .x("Date")
  .y("Value")
  .color(["Symbol", "Metric"])
  .mark("line");
```

:::

## Multiple Y columns and series columns

Multiple y values will first be UNPIVOTED, and then the resulting `color` column will
be concatenated with the specified `color` columns.

**Input data**
<CSVPreview fileName="data/stocks_long_alt.csv"  />

:::duckplot

```js
duckPlot
  .table("stocks_long_alt")
  .x("Date")
  .y(["AAPL", "GOOG"])
  .color("Metric")
  .mark("line");
```

:::

## Multiple X columns

Multiple X columns are only supported in the case of horizontal bar chart
(`barX`). As a correlary to mulitple inputting multiple Y axes for other marks,
this creates two columns: `x`, and `color`,
where the `x` column holds the value, and the `color` holds the name of the unpivoted
columns.

:::duckplot

```js-vue
duckPlot
  .table("stocks_wide")
  .query("select * from stocks_wide where year(Date) = 2017 AND month(Date) = 1")
  .x(["AMZN", "AAPL"])
  .y("Date")
  .mark("barX");

```

:::
