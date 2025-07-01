import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed

const codeString = `duckplot
  .query(\`WITH stats AS (
  SELECT
    MIN("Open") AS min_open,
    MAX("Open") AS max_open
  FROM stocks
),
binned AS (
  SELECT
    stocks."Open",
    stats.min_open,
    stats.max_open,
    (stats.max_open - stats.min_open) / 20.0 AS bin_width
  FROM stocks, stats
)
SELECT
  FLOOR(("Open" - min_open) / bin_width) AS bin,
  COUNT(*) AS count,
  ROUND(min_open + FLOOR(("Open" - min_open) / bin_width) * bin_width, 2) AS bin_start,
  ROUND(min_open + (FLOOR(("Open" - min_open) / bin_width) + 1) * bin_width, 2) AS bin_end
FROM binned
GROUP BY bin, min_open, bin_width
ORDER BY bin\`)
  .table("stocks")
  .x("count")
  .y("bin_start")
  .mark("rectX");
`;

export const histogramX = (options) =>
  renderPlot("stocks.csv", codeString, options);
