// In the case of a rect Mark with a date xAxis, we want to prevent Plot from
// stacking. This requires computing the time interval.
import {
  utcMillisecond,
  utcSecond,
  utcMinute,
  utcHour,
  utcDay,
  utcWeek,
  utcMonth,
  utcYear,
} from "d3-time";
import { min, pairs } from "d3-array";

import { Data } from "../types";

export function computeInterval(data: Data, column: string = "x") {
  // Handle empty data
  if (data.length === 0) {
    return undefined;
  }

  // Sort distinct values (assumes they are repeated for colors / faceting)
  const sortedData = Array.from(
    new Set(data.map((d) => +(d[column] as number)))
  ).sort((a, b) => a - b);

  if (sortedData.length < 2) {
    return undefined; // Not enough data to compute an interval
  }

  // Use `pairs` to generate adjacent pairs and compute the differences
  const differences = pairs(sortedData).map(([a, b]) => b - a);

  // Find the minimum difference
  const minDifference = min(differences) ?? 0; // Handle potential undefined

  // Map minDifference to a D3 time interval
  if (minDifference < 1000) {
    return utcMillisecond; // Sub-second intervals
  } else if (minDifference < 60 * 1000) {
    return utcSecond; // Seconds
  } else if (minDifference < 60 * 60 * 1000) {
    return utcMinute; // Minutes
  } else if (minDifference < 24 * 60 * 60 * 1000) {
    return utcHour; // Hours
  } else if (minDifference < 7 * 24 * 60 * 60 * 1000) {
    return utcDay; // Days
  } else if (minDifference < 30 * 24 * 60 * 60 * 1000) {
    return utcWeek; // Weeks
  } else if (minDifference < 3 * 30 * 24 * 60 * 60 * 1000) {
    return utcMonth; // Months
  } else if (minDifference < 365 * 24 * 60 * 60 * 1000) {
    // Approximate 1 quarter as 3 months
    return utcMonth.every(3); // Quarters
  } else if (minDifference < 10 * 365 * 24 * 60 * 60 * 1000) {
    return utcYear; // Years
  } else if (minDifference < 100 * 365 * 24 * 60 * 60 * 1000) {
    // Approximate 1 decade as 10 years
    return utcYear.every(10); // Decades
  } else {
    // Approximate 1 century as 100 years
    return utcYear.every(100); // Centuries
  }
}
