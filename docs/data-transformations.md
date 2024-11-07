---
outline: deep
---

# Data transformations

## Philosophy

A central problem behind data visualization is the need to transform your data
to a target structure. DuckPlot aims to solve this problem by allowing users to
target the same visualizaiton with different data structures. Let's take a long
and wide view of the same data structure:

<div style="display:flex; gap: 10px;">
<div>

**Long view**

| Symbol | Date       | Open    |
| ------ | ---------- | ------- |
| AAPL   | 2013-05-13 | 64.5014 |
| AAPL   | 2013-05-14 | 64.8357 |
| AAPL   | 2013-05-15 | 62.7371 |
| AAPL   | 2013-05-16 | 60.4629 |

</div>

<div>

**Wide view**

| Date       | AAPL    | AMZN   | GOOG    | IBM    |
| ---------- | ------- | ------ | ------- | ------ |
| 2013-05-13 | 64.5014 | 262.77 | 436.605 | 204.18 |
| 2013-05-14 | 64.8357 | 264.5  | 435.915 | 202.09 |
| 2013-05-15 | 62.7371 | 267.07 | 444.857 | 202.25 |
| 2013-05-16 | 60.4629 | 265.96 | 456.531 | 204    |

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
where the `y` column holds the value, and the `color` holds the name of the
column.

:::duckplot

```js-vue
// Use wide data to show the AAPL and GOOG stock prices
duckPlot
  .table("stocks_pivoted")
  .query("SELECT * from stocks_pivoted where year(Date) = 2018")
  .x("Date")
  .y(["AAPL", "GOOG"])
  .mark("line");
```

:::

## Multiple color columns

Color columns will be **concatenated** into a new column

Given a long data structure where the metric is also stored in the column,
you can specify each Symbol-metric pair as the desired color.

**Input data**
| Symbol | Date | Metric | Value |
|--------|------------|--------|----------|
| AAPL | 2013-05-13 | High | 65.414284|
| AAPL | 2013-05-14 | High | 65.028572|
| AAPL | 2013-05-15 | High | 63.000000|
| AAPL | 2013-05-16 | High | 62.549999|
| AAPL | 2013-05-17 | High | 62.869999|

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
| Date | Metric | AAPL | GOOG |
| ---------- | ------ | --------- | ---------- |
| 2013-05-13 | High | 65.414284 | 438.383728 |
| 2013-05-13 | Low | 64.500000 | 433.868103 |
| 2013-05-14 | High | 65.028572 | 441.473633 |
| 2013-05-14 | Low | 63.164288 | 435.735962 |
| 2013-05-15 | High | 63.000000 | 455.229187 |

:::duckplot

```js-vue
duckPlot
  .query("select * from stocks_long_alt where year(Date) = 2017 AND month(Date) = 1")
  .table("stocks_long_alt")
  .x("Date")
  .y(["AAPL", "GOOG"])
  .color("Metric")
  .mark("line");

```

:::

## Multiple X columns

Multiple X columns are only supported in the case of horizontal bar chart
(`barX`).

:::duckplot

```js-vue
duckPlot
  .query("select * from stocks where year(Date) = 2017 AND month(Date) = 1")
  .table("stocks")
  .x("Close")
  .y("Date")
  .color("Symbol")
  .mark("barX");

```

:::
