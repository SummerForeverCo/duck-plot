import type { MarkOptions, PlotOptions } from "@observablehq/plot";
import * as Plot from "@observablehq/plot";
import { extent } from "d3-array";
import type {
  BasicColumnType,
  ChartData,
  ChartType,
  ColorConfig,
} from "./types";
export const defaultColors = [
  "rgba(255, 0, 184, 1)", // pink (hsla(317, 100%, 50%))
  "rgba(0, 183, 255, 1)", // blue (hsla(194, 100%, 50%))
  "rgba(255, 237, 0, 1)", // yellow (hsla(54, 100%, 50%))
  "rgba(0, 202, 99, 1)", // green (hsla(137, 87%, 54%))
  "rgba(255, 83, 0, 1)", // orange (hsla(22, 100%, 62%))
];
const borderOptions = {
  backgroundColor: "hsla( 0 0% 100%)",
  borderColor: "rgb(228, 229, 231)",
};
// Get options for a specific mark (e.g., the line or area marks)
export function getMarkOptions(
  currentColumns: string[] = [],
  type: ChartType,
  options: {
    color?: string;
    xLabel?: string;
    yLabel?: string;
    r?: number;
    tip?: boolean;
  }
) {
  const color = options.color || defaultColors[0];
  const stroke = currentColumns.includes("series") ? "series" : color;
  const fill = currentColumns.includes("series") ? "series" : color;
  const fx =
    type === "barYGrouped" && currentColumns.includes("fx") ? "fx" : undefined;
  const tip =
    options.tip !== false
      ? {
          tip: {
            stroke: borderOptions.borderColor,
            // Display custom values, hide the auto generated values
            format: {
              xCustom: true,
              yCustom: true,
              color: true,
              x: false,
              y: false,
              fy: false,
              z: false, // Hide the auto generated "series" for area charts
            },
          },
        }
      : {};
  return {
    // Create custom labels for x and y (important if the labels are custom but hidden!)
    channels: {
      xCustom: {
        label: options.xLabel,
        value: "x",
      },
      yCustom: {
        label: options.yLabel,
        value: "y",
      },
    },
    ...tip,
    ...(type === "line" ? { stroke } : { fill }),
    ...(currentColumns.includes("x") ? { x: `x`, sort: (d: any) => d.x } : {}),
    ...(currentColumns.includes("facet") ? { fy: "facet" } : {}),
    ...(fx ? { fx: `fx` } : {}),
    ...(currentColumns.includes("y") ? { y: `y` } : {}),
    ...(options.r ? { r: options.r } : {}),
    ...(currentColumns.includes("series")
      ? { [type === "line" ? "stroke" : "fill"]: `series` }
      : {}),
  } satisfies MarkOptions;
}

// Identify the data currently in the dataset
export function getDataOrder(data: ChartData | undefined, column: string) {
  if (!data) return;
  return { domain: [...new Set(data.map((d: any) => d[column]))] as string[] };
}

// Gets all data orders for the current columns
export function getSorts(currentColumns: string[] = [], data?: ChartData) {
  return currentColumns
    .filter((column) => data && data.types && data?.types[column] === "string")
    .reduce((acc: any, column) => {
      acc[column] = getDataOrder(data, column);
      return acc;
    }, {});
}

// TODO: type this
const defaultOptions = {
  width: 800,
  height: 600,
  xLabelDisplay: true,
  yLabelDisplay: true,
  xLabel: "",
  yLabel: "",
  legend: "",
  hideTicks: false,
  color: defaultColors,
};
// Get the top level configurations for the plot object
export function getTopLevelPlotOptions(
  data: ChartData | undefined,
  currentColumns: string[],
  sorts: any,
  type: ChartType,
  userOptions: {
    width?: number;
    height?: number;
    xLabelDisplay?: boolean;
    yLabelDisplay?: boolean;
    xLabel?: string;
    yLabel?: string;
    legend?: string;
    hideTicks?: boolean;
    color?: ColorConfig;
  }
) {
  const options = { ...defaultOptions, ...userOptions };
  // Only compute a custom x/y domain if the other axes is missing
  // Make sure a minimum of 0 is included for x/y domains
  const xDomain = sorts.x
    ? sorts.x
    : currentColumns.includes("y")
    ? {}
    : {
        domain: extent(
          [...data!, ...[data?.types?.x === "number" ? { x: 0 } : {}]],
          (d) => d.x
        ),
      };
  const yDomain = sorts.y
    ? sorts.y
    : currentColumns.includes("x")
    ? {}
    : {
        domain: extent(
          [...data!, ...[data?.types?.y === "number" ? { y: 0 } : {}]],
          (d) => d.y
        ),
      };

  // Handle 3 options for color: note, color as a string is assigned in the mark
  const { color: colorConfig, legend } = options;
  const { domain: sortsDomain } = sorts.series || {};

  let colorDomain, colorRange, colorScheme;

  const categoricalColor = data?.types?.series === "string";
  // Array of strings is treated as the range
  if (Array.isArray(colorConfig)) {
    colorRange = colorConfig;
    colorDomain = sortsDomain;
  }
  // Object with optional values for domain, range, and scheme
  else if (typeof colorConfig === "object" && colorConfig !== null) {
    colorDomain = colorConfig.domain || sortsDomain;
    colorRange = colorConfig.range;
    colorScheme = colorConfig.scheme;
  }
  // Default values
  else {
    colorDomain = sortsDomain;
    colorRange = categoricalColor ? defaultColors : undefined;
    colorScheme = !categoricalColor ? "RdPu" : undefined;
  }

  const hasColor = currentColumns.includes("series") || colorConfig;

  const color = hasColor
    ? {
        label: legend,
        ...(colorDomain && { domain: colorDomain }),
        ...(colorRange && { range: colorRange }),
        ...(colorScheme && { scheme: colorScheme }),
      }
    : {};
  return {
    x:
      type === "barYGrouped" && currentColumns.includes("fx")
        ? { axis: null }
        : {
            label: !options.xLabelDisplay ? null : options.xLabel,
            tickSize: 0,
            tickPadding: 5,
            ...(!options.xLabelDisplay || !options.xLabel
              ? { labelArrow: "none" }
              : {}),
            ...(currentColumns.includes("x") &&
              getTickFormatter(
                data?.types?.x,
                "x",
                options.width || 0,
                options.height || 0,
                options.hideTicks
              )),
            ...xDomain,
          },
    y: {
      label: !options.yLabelDisplay ? null : options.yLabel,
      labelArrow: !options.yLabelDisplay || !options.yLabel ? "none" : true,
      labelAnchor: "top",
      tickSize: 0,
      tickPadding: 5,
      ...(currentColumns.includes("y") &&
        getTickFormatter(
          data?.types?.y,
          "y",
          options.width || 0,
          options.height || 0,
          options.hideTicks
        )),
      ...yDomain,
    },
    fx: { label: null },
    width: options.width,
    height: options.height,
    className: "plot-chart",
    grid: false,
    style: {
      overflow: "visible",
    },
    ...(currentColumns.includes("facet")
      ? { fy: { ...sorts.facet, axis: null, label: null }, insetTop: 12 }
      : {}),
    ...{ color },
  } as PlotOptions;
}

// Helpers function for axis labels
export function truncateText(
  text: string,
  direction: "x" | "y",
  width: number,
  height: number
) {
  // Set the number of characters based on the available space
  const size = direction === "y" ? width : height;
  const fixedMax = 30;
  const maxCharacters = Math.min(Math.floor((size * 0.2) / 3), fixedMax);
  if (text.length > maxCharacters) {
    return text.substring(0, maxCharacters) + "…";
  }
  return text;
}

// For string variables, either hide or truncate the text. Let plot handle
// dates and numbers for now
export function getTickFormatter(
  colType: BasicColumnType,
  direction: "x" | "y",
  width: number,
  height: number,
  hideTicks?: boolean
) {
  if (hideTicks) {
    return { tickFormat: () => "" };
  } else if (colType === "string") {
    return {
      tickFormat: (text: string) =>
        truncateText(text, direction, width, height),
    };
  }
  return {};
}

// Gets the type of legend to handle rendering
export function getLegendType(
  data: any,
  currentColumns: string[]
): "categorical" | "continuous" | undefined {
  if (!data.types || !currentColumns.includes("series")) return;
  return data.types.series === "string" ? "categorical" : "continuous";
}

type MarkType = "dot" | "areaY" | "line" | "barX" | "barY";

// Get the plot mark type associated with our chart type
export function getPlotMarkType(type: ChartType): MarkType {
  switch (type) {
    case "barYGrouped":
      return "barY";
    default:
      return type as MarkType;
  }
}

// TODO: input options type
export function getCommonMarks(
  type: ChartType,
  currentColumns: string[],
  inputOptions?: any
) {
  const options = { ...borderOptions, ...inputOptions };
  return [
    Plot.frame({
      stroke: options.borderColor,
      // fill: options.background,
      rx: 4,
      ry: 4,
      ...(type === "barYGrouped" ? { facet: "super" } : {}),
    }),
    ...[
      currentColumns?.includes("y")
        ? Plot.gridY({
            stroke: options.borderColor,
            strokeDasharray: "1.5,1.5",
            strokeOpacity: 1,
          })
        : [],
    ],
  ];
}

export function getFacetMarks(data: ChartData, currentColumns: string[]) {
  return currentColumns.includes("facet")
    ? [
        Plot.text(
          data,
          Plot.selectFirst({
            text: (d) => d.facet,
            fy: (d) => d.facet,
            frameAnchor: "top-left",
            facetAnchor: "left",
            dy: 3,
            dx: 3,
          })
        ),
      ]
    : [];
}
