import { describe, it, expect } from "vitest";
import { computeInterval } from "../src/options/getInterval";
import {
  utcMillisecond,
  utcSecond,
  utcMinute,
  utcHour,
  utcDay,
  utcWeek,
  utcMonth,
  utcYear,
} from "d3";

describe("computeInterval", () => {
  it("returns utcMillisecond for sub-second intervals", () => {
    const data = [{ x: 0 }, { x: 500 }];
    const result = computeInterval(data);
    expect(result).toBe(utcMillisecond);
  });

  it("returns utcSecond for second intervals", () => {
    const data = [{ x: 0 }, { x: 1000 }];
    const result = computeInterval(data);
    expect(result).toBe(utcSecond);
  });

  it("returns utcMinute for minute intervals", () => {
    const data = [{ x: 0 }, { x: 60 * 1000 }];
    const result = computeInterval(data);
    expect(result).toBe(utcMinute);
  });

  it("returns utcHour for hour intervals", () => {
    const data = [{ x: 0 }, { x: 60 * 60 * 1000 }];
    const result = computeInterval(data);
    expect(result).toBe(utcHour);
  });

  it("returns utcDay for day intervals", () => {
    const data = [{ x: 0 }, { x: 24 * 60 * 60 * 1000 }];
    const result = computeInterval(data);
    expect(result).toBe(utcDay);
  });

  it("returns utcWeek for week intervals", () => {
    const data = [{ x: 0 }, { x: 7 * 24 * 60 * 60 * 1000 }];
    const result = computeInterval(data);
    expect(result).toBe(utcWeek);
  });

  it("returns utcMonth for month intervals", () => {
    const data = [{ x: 0 }, { x: 30 * 24 * 60 * 60 * 1000 }];
    const result = computeInterval(data);
    expect(result).toBe(utcMonth);
  });

  it("returns utcMonth.every(3) for quarter intervals", () => {
    const data = [{ x: 0 }, { x: 3 * 30 * 24 * 60 * 60 * 1000 }];
    const result = computeInterval(data);

    // Validate that the interval steps are correct
    const interval = result?.range(
      new Date(0),
      new Date(365 * 24 * 60 * 60 * 1000)
    );
    const expectedInterval = utcMonth
      .every(3)
      ?.range(new Date(0), new Date(365 * 24 * 60 * 60 * 1000));

    expect(interval).toEqual(expectedInterval);
  });

  it("returns utcYear for year intervals", () => {
    const data = [{ x: 0 }, { x: 365 * 24 * 60 * 60 * 1000 }];
    const result = computeInterval(data);
    expect(result).toBe(utcYear);
  });

  it("returns utcYear.every(10) for decade intervals", () => {
    const data = [{ x: 0 }, { x: 10 * 365 * 24 * 60 * 60 * 1000 }];
    const result = computeInterval(data);

    // Validate interval behavior using .range()
    const interval = result?.range(
      new Date(0),
      new Date(100 * 365 * 24 * 60 * 60 * 1000)
    );
    const expectedInterval = utcYear
      .every(10)
      ?.range(new Date(0), new Date(100 * 365 * 24 * 60 * 60 * 1000));

    expect(interval).toEqual(expectedInterval);
  });

  it("returns utcYear.every(100) for century intervals", () => {
    const data = [{ x: 0 }, { x: 100 * 365 * 24 * 60 * 60 * 1000 }];
    const result = computeInterval(data);

    // Validate interval behavior using .range()
    const interval = result?.range(
      new Date(0),
      new Date(1000 * 365 * 24 * 60 * 60 * 1000)
    );
    const expectedInterval = utcYear
      .every(100)
      ?.range(new Date(0), new Date(1000 * 365 * 24 * 60 * 60 * 1000));

    expect(interval).toEqual(expectedInterval);
  });

  it("handles data with duplicate values", () => {
    const data = [{ x: 0 }, { x: 1000 }, { x: 1000 }];
    const result = computeInterval(data);
    expect(result).toBe(utcSecond);
  });

  it("handles an empty data array", () => {
    const data: any[] = [];
    const result = computeInterval(data);
    expect(result).toBe(undefined); // Assuming your function gracefully handles empty arrays
  });

  it("handles a column other than 'x'", () => {
    const data = [{ y: 0 }, { y: 60 * 1000 }];
    const result = computeInterval(data, "y");
    expect(result).toBe(utcMinute);
  });
});
