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

  const second = 1000;
  const minute = 60 * second;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 4 * week;
  const quarter = month * 3;
  const year = 365 * day;
  const decade = 10 * year;
  const century = 100 * year;

  // Map minDifference to a D3 time interval
  if (minDifference < second) {
    return utcMillisecond; // Sub-second intervals
  } else if (minDifference < minute) {
    return utcSecond; // Seconds
  } else if (minDifference < hour) {
    return utcMinute; // Minutes
  } else if (minDifference < day) {
    return utcHour; // Hours
  } else if (minDifference < week) {
    return utcDay; // Days
  } else if (minDifference < month) {
    return utcWeek; // Weeks
  } else if (minDifference < quarter) {
    return utcMonth; // Months
  } else if (minDifference < year) {
    return utcMonth.every(3); // Quarters
  } else if (minDifference < decade) {
    return utcYear; // Years
  } else if (minDifference < century) {
    return utcYear.every(10); // Decades
  } else {
    return utcYear.every(100); // Centuries
  }
}
