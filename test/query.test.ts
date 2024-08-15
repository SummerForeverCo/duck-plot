import { describe, expect, it } from "vitest";

import {
  extractDefinedValues,
  getAggregateInfo,
  getStandardTransformQuery,
  getTransformQuery,
  getTransformType,
  getUnpivotQuery,
  getUnpivotWithSeriesQuery,
  maybeConcatCols,
  quoteColumns,
  standardColName,
  toTitleCase,
} from "../src/query";

function removeSpacesAndBreaks(str: string) {
  return str.replace(/\s+/g, "");
}
describe("getTransformType", () => {
  it('barX: should return a "standard" transform with 1 x and 1 y', () => {
    const config = { x: ["x1"], y: ["y1"], series: [], facet: [] };
    expect(getTransformType("barX", config)).toBe("standard");
  });
  it('barX: should return an "unPivot" transform with 2 x-axes and 1 y', () => {
    const config = {
      x: ["x1", "x2"],
      y: ["y1"],
      series: [],
      facet: [],
    };
    expect(getTransformType("barX", config)).toBe("unPivot");
  });

  it('barX: should return an "unPivotWithSeries" transform with 2 x-axes, 1 y, 1 series', () => {
    const config = {
      x: ["x1", "x2"],
      y: ["y1"],
      series: ["series1"],
      facet: [],
    };
    expect(getTransformType("barX", config)).toBe("unPivotWithSeries");
  });

  it('barY: should return a "standard" transform with 1 x and 1 y', () => {
    const config = { x: ["x1"], y: ["y1"], series: [], facet: [] };
    expect(getTransformType("barY", config)).toBe("standard");
  });
  it('barY: should return an "unPivot" transform with 2 y-axes and 1 x', () => {
    const config = {
      x: ["x1"],
      y: ["y1", "y2"],
      series: [],
      facet: [],
    };
    expect(getTransformType("barY", config)).toBe("unPivot");
  });

  it('barY: should return an "unPivotWithSeries" transform with 2 y-axes, 1 y, 1 series', () => {
    const config = {
      x: ["x1"],
      y: ["y1", "y2"],
      series: ["series1"],
      facet: [],
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
      facet: ["f1"],
    };
    const tableName = "yourTableName";
    const reshapedName = "reshaped";
    const expectedQuery = `CREATE TABLE reshaped as SELECT "x1" as x, "y1" as y, "s1" as series, "f1" as facet FROM yourTableName`;
    expect(
      getStandardTransformQuery("line", config, tableName, reshapedName)
    ).toBe(expectedQuery);
  });

  it("should handle grouped barY", () => {
    const config = {
      x: ["x1"],
      y: ["y1"],
      series: ["s1"],
      facet: ["f1"],
    };
    const tableName = "yourTableName";
    const reshapedName = "reshaped";
    const expectedQuery = `CREATE TABLE reshaped as SELECT "x1" as fx, "s1" as series, "s1" as x, "y1" as y, "f1" as facet FROM yourTableName`;
    expect(
      getStandardTransformQuery("barYGrouped", config, tableName, reshapedName)
    ).toBe(expectedQuery);
  });
});

describe("getUnpivotQuery", () => {
  it("should build unpivot query correctly for barX type", () => {
    const config = {
      x: ["x1", "x2"],
      y: ["y1"],
      facet: [],
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

  it("should build unpivot query correctly for barX type with facet", () => {
    const config = {
      x: ["x1", "x2"],
      y: ["y1"],
      facet: ["facet 1", "facet 2"],
      series: [],
    };
    const tableName = "yourTableName";
    const reshapedName = "reshaped";
    const expectedQuery = `CREATE TABLE reshaped as SELECT "y1" as y, value AS x, concat_ws('-', "facet 1", "facet 2") as facet, key AS series FROM "yourTableName"
        UNPIVOT (value FOR key IN ("x1", "x2"));`;

    expect(getUnpivotQuery("barX", config, tableName, reshapedName)).toBe(
      expectedQuery
    );
  });

  it("should build unpivot query correctly for area type with facet", () => {
    const config = {
      x: ["x1"],
      y: ["y1", "y2"],
      facet: ["facet 1", "facet 2"],
      series: [],
    };
    const tableName = "yourTableName";
    const reshapedName = "reshaped";

    const expectedQuery = `CREATE TABLE reshaped as SELECT "x1" as x, value AS y, concat_ws('-', "facet 1", "facet 2") as facet, key AS series FROM "yourTableName"
        UNPIVOT (value FOR key IN ("y1", "y2"));`;

    expect(getUnpivotQuery("areaY", config, tableName, reshapedName)).toBe(
      expectedQuery
    );
  });

  it("should build unpivot query correctly for barYGrouped with facet", () => {
    const config = {
      x: ["x1"],
      y: ["y1", "y2"],
      facet: ["facet 1", "facet 2"],
      series: [],
    };
    const tableName = "yourTableName";
    const reshapedName = "reshaped";

    const expectedQuery = `CREATE TABLE reshaped as SELECT "x1" as fx, value AS y, concat_ws('-', "facet 1", "facet 2") as facet, key AS x, key AS series FROM "yourTableName"
      UNPIVOT (value FOR key IN ("y1", "y2"));`;
    const result = getUnpivotQuery(
      "barYGrouped",
      config,
      tableName,
      reshapedName
    );
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
      facet: [],
    };
    const tableName = "yourTableName";
    const reshapedName = "reshaped";
    const expectedQuery = `CREATE TABLE reshaped as SELECT
            x,
            y,
            concat_ws('-', pivotCol, series) AS series,
        FROM (
            SELECT
                "x1", "x2",
                "y1" as y,
                concat_ws('-', "s1", "s2") as series,
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
      facet: [],
    };
    const tableName = "yourTableName";
    const reshapedName = "reshaped";
    const expectedQuery = `CREATE TABLE reshaped as SELECT
            x,
            y,
            concat_ws('-', pivotCol, series) AS series,
        FROM (
            SELECT
                "x1" as x,
                "y1", "y2",
                concat_ws('-', "s1", "s2") as series,
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

  it("should build unpivot with series query correctly for area type with facets", () => {
    const config = {
      x: ["x1"],
      y: ["y1", "y2"],
      series: ["s1", "s2"],
      facet: ["f1", "f2"],
    };
    const tableName = "yourTableName";
    const reshapedName = "reshaped";
    const expectedQuery = `CREATE TABLE reshaped as SELECT
            x,
            y,
            concat_ws('-', pivotCol, series) AS series,
            facet
        FROM (
            SELECT
                "x1" as x,
                "y1", "y2",
                concat_ws('-', "s1", "s2") as series,
                concat_ws('-', "f1", "f2") as facet
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

  it("should build unpivot with series query correctly for barYGrouped with facets", () => {
    const config = {
      x: ["x1"],
      y: ["y1", "y2"],
      series: ["s1", "s2"],
      facet: ["f1", "f2"],
    };
    const tableName = "yourTableName";
    const reshapedName = "reshaped";
    const expectedQuery = `CREATE TABLE reshaped as SELECT
            concat_ws('-', pivotCol, series) AS x,
            y,
            concat_ws('-', pivotCol, series) AS series,
            fx,
            facet
        FROM (
            SELECT
                "x1" as fx,
                "y1", "y2",
                concat_ws('-', "s1", "s2") as series,
                concat_ws('-', "f1", "f2") as facet
            FROM
                yourTableName
        ) p
        UNPIVOT (
            y FOR pivotCol IN ("y1", "y2")
        );`;
    const result = getUnpivotWithSeriesQuery(
      "barYGrouped",
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
    const config = { x: ["x1"], y: ["y1"], series: [], facet: [] };
    const tableName = "yourTableName";
    const reshapedName = "reshaped";
    const expectedQuery = `CREATE TABLE reshaped as SELECT "x1" as x, "y1" as y FROM ${tableName}`;
    expect(getTransformQuery("line", config, tableName, reshapedName)).toBe(
      expectedQuery
    );
  });
});

describe("extractDefinedValues", () => {
  it("should return empty array if value is undefined", () => {
    expect(extractDefinedValues(undefined)).toEqual([]);
  });

  it("should return array with single value if input is a string", () => {
    expect(extractDefinedValues("value")).toEqual(["value"]);
  });

  it("should filter out undefined values from array", () => {
    expect(extractDefinedValues(["value", undefined])).toEqual(["value"]);
  });
});

describe("getAggregateInfo", () => {
  it("barX: should sum X if x present", () => {
    const config = { x: ["x"], y: ["y1"], series: [], facet: [] };
    const columns = ["x", "y"];
    const reshapedName = "reshaped";
    const expectedQueryString = `SELECT y,  sum(x::FLOAT) as x FROM reshaped GROUP BY y ORDER BY y`;
    expect(
      getAggregateInfo("barX", config, columns, reshapedName).queryString
    ).toBe(expectedQueryString);
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
  it("should convert string to title case", () => {
    expect(toTitleCase("some_title_case")).toBe("Some Title Case");
  });

  it("should handle empty input gracefully", () => {
    expect(toTitleCase()).toBe("");
  });
});
