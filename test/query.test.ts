import { describe, expect, it } from "vitest";

import {
  arrayIfy,
  getAggregateInfo,
  getOrder,
  getStandardTransformQuery,
  getTransformQuery,
  getTransformType,
  getUnpivotQuery,
  getUnpivotWithSeriesQuery,
  maybeConcatCols,
  quoteColumns,
  standardColName,
  toTitleCase,
  getLabel,
} from "../src/query";

function removeSpacesAndBreaks(str: string) {
  return str.replace(/\s+/g, "");
}
describe("getTransformType", () => {
  it('barX: should return a "standard" transform with 1 x and 1 y', () => {
    const config = { x: ["x1"], y: ["y1"], series: [], fy: [] };
    expect(getTransformType("barX", config)).toBe("standard");
  });
  it('barX: should return an "unPivot" transform with 2 x-axes and 1 y', () => {
    const config = {
      x: ["x1", "x2"],
      y: ["y1"],
      series: [],
      fy: [],
    };
    expect(getTransformType("barX", config)).toBe("unPivot");
  });

  it('barX: should return an "unPivotWithSeries" transform with 2 x-axes, 1 y, 1 series', () => {
    const config = {
      x: ["x1", "x2"],
      y: ["y1"],
      series: ["series1"],
      fy: [],
    };
    expect(getTransformType("barX", config)).toBe("unPivotWithSeries");
  });

  it('barY: should return a "standard" transform with 1 x and 1 y', () => {
    const config = { x: ["x1"], y: ["y1"], series: [], fy: [] };
    expect(getTransformType("barY", config)).toBe("standard");
  });
  it('barY: should return an "unPivot" transform with 2 y-axes and 1 x', () => {
    const config = {
      x: ["x1"],
      y: ["y1", "y2"],
      series: [],
      fy: [],
    };
    expect(getTransformType("barY", config)).toBe("unPivot");
  });

  it('barY: should return an "unPivotWithSeries" transform with 2 y-axes, 1 y, 1 series', () => {
    const config = {
      x: ["x1"],
      y: ["y1", "y2"],
      series: ["series1"],
      fy: [],
    };
    expect(getTransformType("barY", config)).toBe("unPivotWithSeries");
  });
});

describe("getStandardTransformQuery", () => {
  it("should build standard query correctly", () => {
    const config = {
      x: ["x1"],
      y: ["y1"],
      series: ["s1"],
      fy: ["f1"],
    };
    const tableName = "yourTableName";
    const reshapedName = "reshaped";
    const expectedQuery = `CREATE TABLE reshaped as SELECT "x1" as x, "y1" as y, "s1" as series, "f1" as fy FROM yourTableName`;
    expect(
      getStandardTransformQuery("line", config, tableName, reshapedName)
    ).toBe(expectedQuery);
  });
});

describe("getUnpivotQuery", () => {
  it("should build unpivot query correctly for barX type", () => {
    const config = {
      x: ["x1", "x2"],
      y: ["y1"],
      fy: [],
      series: [],
    };
    const tableName = "yourTableName";
    const reshapedName = "reshaped";
    const expectedQuery = `CREATE TABLE reshaped as SELECT "y1" as y, value AS x, key AS series FROM "yourTableName"
        UNPIVOT (value FOR key IN ("x1", "x2"));`;
    const result = getUnpivotQuery("barX", config, tableName, reshapedName);
    expect(removeSpacesAndBreaks(result)).toBe(
      removeSpacesAndBreaks(expectedQuery)
    );
  });

  it("should build unpivot query correctly for barX type with fy", () => {
    const config = {
      x: ["x1", "x2"],
      y: ["y1"],
      fy: ["fy 1", "fy 2"],
      series: [],
    };
    const tableName = "yourTableName";
    const reshapedName = "reshaped";
    const expectedQuery = `CREATE TABLE reshaped as SELECT "y1" as y, value AS x, concat_ws('-', "fy 1", "fy 2") as fy, key AS series FROM "yourTableName"
        UNPIVOT (value FOR key IN ("x1", "x2"));`;

    expect(getUnpivotQuery("barX", config, tableName, reshapedName)).toBe(
      expectedQuery
    );
  });

  it("should build unpivot query correctly for area type with fy", () => {
    const config = {
      x: ["x1"],
      y: ["y1", "y2"],
      fy: ["fy 1", "fy 2"],
      series: [],
    };
    const tableName = "yourTableName";
    const reshapedName = "reshaped";

    const expectedQuery = `CREATE TABLE reshaped as SELECT "x1" as x, value AS y, concat_ws('-', "fy 1", "fy 2") as fy, key AS series FROM "yourTableName"
        UNPIVOT (value FOR key IN ("y1", "y2"));`;
    const result = getUnpivotQuery("areaY", config, tableName, reshapedName);
    expect(removeSpacesAndBreaks(result)).toBe(
      removeSpacesAndBreaks(expectedQuery)
    );
  });
});

describe("getUnpivotWithSeriesQuery", () => {
  it("should build unpivot with series query correctly for barX type", () => {
    const config = {
      x: ["x1", "x2"],
      y: ["y1"],
      series: ["s1", "s2"],
      fy: [],
    };
    const tableName = "yourTableName";
    const reshapedName = "reshaped";
    const expectedQuery = `CREATE TABLE reshaped AS SELECT
            x,
            y,
            concat_ws('-', pivotCol, series) AS series
        FROM (
            SELECT
                "x1", "x2",
                "y1" as y,
                concat_ws('-', "s1", "s2") as series
            FROM
                yourTableName
        ) p
        UNPIVOT (
            x FOR pivotCol IN ("x1", "x2")
        );`;
    const result = getUnpivotWithSeriesQuery(
      "barX",
      config,
      tableName,
      reshapedName
    );
    expect(removeSpacesAndBreaks(result)).toBe(
      removeSpacesAndBreaks(expectedQuery)
    );
  });

  it("should build unpivot with series query correctly for area type", () => {
    const config = {
      x: ["x1"],
      y: ["y1", "y2"],
      series: ["s1", "s2"],
      fy: [],
    };
    const tableName = "yourTableName";
    const reshapedName = "reshaped";
    const expectedQuery = `CREATE TABLE reshaped AS SELECT
            x,
            y,
            concat_ws('-', pivotCol, series) AS series
        FROM (
            SELECT
                "x1" as x,
                "y1", "y2",
                concat_ws('-', "s1", "s2") as series
            FROM
                yourTableName
        ) p
        UNPIVOT (
            y FOR pivotCol IN ("y1", "y2") 
        );`;
    const result = getUnpivotWithSeriesQuery(
      "areaY",
      config,
      tableName,
      reshapedName
    );
    expect(removeSpacesAndBreaks(result)).toBe(
      removeSpacesAndBreaks(expectedQuery)
    );
  });

  it("should build unpivot with series query correctly for area type with fys", () => {
    const config = {
      x: ["x1"],
      y: ["y1", "y2"],
      series: ["s1", "s2"],
      fy: ["f1", "f2"],
    };
    const tableName = "yourTableName";
    const reshapedName = "reshaped";
    const expectedQuery = `CREATE TABLE reshaped AS SELECT
            x,
            y,
            concat_ws('-', pivotCol, series) AS series,
            fy
        FROM (
            SELECT
                "x1" as x,
                "y1", "y2",
                concat_ws('-', "s1", "s2") as series,
                concat_ws('-', "f1", "f2") as fy
            FROM
                yourTableName
        ) p
        UNPIVOT (
            y FOR pivotCol IN ("y1", "y2")
        );`;
    const result = getUnpivotWithSeriesQuery(
      "areaY",
      config,
      tableName,
      reshapedName
    );
    expect(removeSpacesAndBreaks(result)).toBe(
      removeSpacesAndBreaks(expectedQuery)
    );
  });
});

describe("getTransformQuery", () => {
  it("should return standard transform query correctly", () => {
    const config = { x: ["x1"], y: ["y1"], series: [], fy: [] };
    const tableName = "yourTableName";
    const reshapedName = "reshaped";
    const expectedQuery = `CREATE TABLE reshaped as SELECT "x1" as x, "y1" as y FROM ${tableName}`;
    expect(
      getTransformQuery("line", config, tableName, reshapedName, { value: "" })
    ).toBe(expectedQuery);
  });
});

describe("arrayify", () => {
  it("should return empty array if value is undefined", () => {
    expect(arrayIfy(undefined)).toEqual([]);
  });

  it("should return array with single value if input is a string", () => {
    expect(arrayIfy("value")).toEqual(["value"]);
  });

  it("should filter out undefined values from array", () => {
    expect(arrayIfy(["value", undefined])).toEqual(["value"]);
  });
});

describe("getAggregateInfo", () => {
  // Test for 'barX' aggregation when `x` is present
  it("barX: should sum X if x present", () => {
    const config = { x: ["x"], y: ["y1"], series: [], fy: [] };
    const columns = ["x", "y"];
    const reshapedName = "reshaped";
    const expectedQueryString = `
      WITH aggregated AS (
        SELECT y, sum(x::FLOAT) as x
        FROM reshaped
        GROUP BY y
      )
      SELECT y, x
      FROM aggregated
    `;

    expect(
      removeSpacesAndBreaks(
        getAggregateInfo("barX", config, columns, reshapedName, undefined, {
          value: "",
        }).queryString
      )
    ).toBe(removeSpacesAndBreaks(expectedQueryString));
  });

  // Test for 'barY' aggregation when `y` is present
  it("barY: should sum Y if y present", () => {
    const config = { x: ["x1"], y: ["y"], series: [], fy: [] };
    const columns = ["x", "y"];
    const reshapedName = "reshaped";
    const expectedQueryString = `
      WITH aggregated AS (
        SELECT x, sum(y::FLOAT) as y
        FROM reshaped
        GROUP BY x
      )
      SELECT x, y
      FROM aggregated
    `;

    expect(
      removeSpacesAndBreaks(
        getAggregateInfo("barY", config, columns, reshapedName, undefined, {
          value: "",
        }).queryString
      )
    ).toBe(removeSpacesAndBreaks(expectedQueryString));
  });

  // Test with a mean aggregation (for `x`) and percentage flag false
  it("barX: should calculate mean X without percentage", () => {
    const config = { x: ["x"], y: ["y1"], series: [], fy: [] };
    const columns = ["x", "y"];
    const reshapedName = "reshaped";
    const expectedQueryString = `
      WITH aggregated AS (
        SELECT y, avg(x::FLOAT) as x
        FROM reshaped
        GROUP BY y
      )
      SELECT y, x
      FROM aggregated
    `;

    expect(
      removeSpacesAndBreaks(
        getAggregateInfo(
          "barX",
          config,
          columns,
          reshapedName,
          "avg",
          {
            value: "",
          },
          false
        ).queryString
      )
    ).toBe(removeSpacesAndBreaks(expectedQueryString));
  });

  // Test with a sum aggregation (for `x`) and percentage flag true
  it("barX: should calculate percentage of X after sum aggregation", () => {
    const config = { x: ["x"], y: ["y1"], series: [], fy: [] };
    const columns = ["x", "y"];
    const reshapedName = "reshaped";
    const expectedQueryString = `
      WITH aggregated AS (
        SELECT y, sum(x::FLOAT) as x
        FROM reshaped
        GROUP BY y
      )
      SELECT y, (x / (SUM(x) OVER (PARTITION BY y))) * 100 as x
      FROM aggregated
    `;

    expect(
      removeSpacesAndBreaks(
        getAggregateInfo(
          "barX",
          config,
          columns,
          reshapedName,
          "sum",
          {
            value: "",
          },
          true
        ).queryString
      )
    ).toBe(removeSpacesAndBreaks(expectedQueryString));
  });

  // Test with mean aggregation (for `y`) and percentage flag true
  it("barY: should calculate percentage of Y after mean aggregation", () => {
    const config = { x: ["x1"], y: ["y"], series: [], fy: [] };
    const columns = ["x", "y"];
    const reshapedName = "reshaped";
    const expectedQueryString = `
      WITH aggregated AS (
        SELECT x, avg(y::FLOAT) as y
        FROM reshaped
        GROUP BY x
      )
      SELECT x, (y / (SUM(y) OVER (PARTITION BY x))) * 100 as y
      FROM aggregated
    `;

    expect(
      removeSpacesAndBreaks(
        getAggregateInfo(
          "barY",
          config,
          columns,
          reshapedName,
          "avg",
          {
            value: "",
          },
          true
        ).queryString
      )
    ).toBe(removeSpacesAndBreaks(expectedQueryString));
  });

  // Test with no aggregation and default selection (for non-aggregated data)
  it("should return non-aggregated data when aggregation is false", () => {
    const config = { x: ["x1"], y: ["y1"], series: [], fy: [] };
    const columns = ["x", "y"];
    const reshapedName = "reshaped";
    const expectedQueryString = `WITH aggregated AS (SELECT * FROM reshaped) 
    SELECT y, x FROM aggregated`;

    expect(
      removeSpacesAndBreaks(
        getAggregateInfo("barX", config, columns, reshapedName, false, {
          value: "",
        }).queryString
      )
    ).toBe(removeSpacesAndBreaks(expectedQueryString));
  });
});

describe("maybeConcatCols", () => {
  it("should concatenate columns correctly", () => {
    const cols = ["col1", "col2"];
    const expectedConcat = `concat_ws('-', "col1", "col2")`;
    expect(maybeConcatCols(cols)).toBe(expectedConcat);
  });
});

describe("standardColName", () => {
  it("should format standard column name correctly", () => {
    const obj = { x: ["x1"] };
    const column = "x";
    const expectedColName = `"x1" as x`;
    expect(standardColName(obj, column)).toBe(expectedColName);
  });
});

describe("quoteColumns", () => {
  it("should quote columns correctly", () => {
    const columns = ["col1", "col2"];
    const expectedQuoted = [`"col1"`, `"col2"`];
    expect(quoteColumns(columns)).toEqual(expectedQuoted);
  });
});

describe("toTitleCase", () => {
  it("should not change single words (without spaces, dashes, or underscores)", () => {
    expect(toTitleCase("DAU")).toBe("DAU");
  });

  it("should convert strings with implied spaces to title case", () => {
    expect(toTitleCase("some_column_name")).toBe("Some Column Name");
    expect(toTitleCase("someColumnName")).toBe("Some Column Name");
    expect(toTitleCase("some-column-name")).toBe("Some Column Name");
    expect(toTitleCase("some column name")).toBe("Some Column Name");
    expect(toTitleCase("SOME COLUMN NAME")).toBe("Some Column Name");
  });

  it("should handle empty input gracefully", () => {
    expect(toTitleCase()).toBe("");
  });
});

describe("getLabel", () => {
  it("should return the title case of a single value", () => {
    expect(getLabel("DAU")).toBe(toTitleCase("DAU"));
  });
  it("should first title case each column then join them", () => {
    const columns = ["columnOne", "columnTwo"];
    const expected = columns.map(toTitleCase).join(", ");
    expect(getLabel(columns)).toBe(expected);
    expect(getLabel(["AAPL", "GOOG"])).toBe("AAPL, GOOG");
  });
});

describe("getOrder", () => {
  it("should return no ordering without multiple axes", () => {
    const result = getOrder(["groupA", "series"], "barX", [], []);
    const expected = "";
    expect(removeSpacesAndBreaks(result)).toEqual(expected);
  });

  it("should remove 'series' from orderBy when 'series' is included and conditions are met", () => {
    const result = getOrder(["series", "groupA"], "barX", ["x1", "x2"], []);
    const expected = removeSpacesAndBreaks(`groupA, CASE 
    WHEN series like 'x1%' THEN 1
    WHEN series like 'x2%' THEN 2
    ELSE 3 
END;`);
    expect(removeSpacesAndBreaks(result)).toEqual(expected);
  });

  it("should add CASE statement for 'barX' type with multiple x values", () => {
    const result = getOrder(["groupA", "series"], "barX", ["x1", "x2"], []);
    const expected = removeSpacesAndBreaks(`groupA, CASE 
    WHEN series like 'x1%' THEN 1
    WHEN series like 'x2%' THEN 2
    ELSE 3 
END;`);
    expect(removeSpacesAndBreaks(result)).toEqual(expected);
  });

  it("should add CASE statement for non-'barX' type with multiple y values", () => {
    const result = getOrder(["groupA", "series"], "barY", [], ["y1", "y2"]);
    const expected = removeSpacesAndBreaks(`groupA, CASE 
    WHEN series like 'y1%' THEN 1
    WHEN series like 'y2%' THEN 2
    ELSE 3 
END;`);
    expect(removeSpacesAndBreaks(result)).toEqual(expected);
  });

  it("should remove both 'series' and 'x' from orderBy when 'fx' is in groupBy and conditions are met", () => {
    const result = getOrder(["fx", "series", "x"], "barY", [], ["y1", "y2"]);
    const expected = removeSpacesAndBreaks(`fx, CASE 
    WHEN series like 'y1%' THEN 1
    WHEN series like 'y2%' THEN 2
    ELSE 3 
END;`);
    expect(removeSpacesAndBreaks(result)).toEqual(expected);
  });

  it("should handle a single x or y value without CASE statement and return no order", () => {
    const result = getOrder(["groupA", "series"], "barX", ["x1"], []);
    const expected = "";
    expect(removeSpacesAndBreaks(result)).toEqual(expected);
  });

  it("should handle a single y value without CASE statement for non-barX and return no order", () => {
    const result = getOrder(["groupA", "series"], "barY", [], ["y1"]);
    const expected = "";
    expect(removeSpacesAndBreaks(result)).toEqual(expected);
  });
});
