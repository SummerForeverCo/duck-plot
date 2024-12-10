import type { DuckPlot } from "..";
import type {
  MarkOptions,
  PlotOptions,
  StackOptions,
} from "@observablehq/plot";
import * as Plot from "@observablehq/plot";
import { extent } from "d3-array";
import type {
  BasicColumnType,
  Data,
  ChartType,
  ColumnType,
  Config,
  Indexable,
  Sorts,
} from "../types";
import { borderOptions, defaultColors } from "../helpers";
// Extend the MarkOptions to include all the stack options
interface AllMarkOptions extends MarkOptions, StackOptions {}

// Identify the data currently in the dataset
export function getDataOrder(data: Data | undefined, column: string) {
  if (!data) return;
  return { domain: [...new Set(data.map((d: any) => d[column]))] as string[] };
}

// Gets all data orders for the current columns
// TODO: perhaps cast series to varchar in the data, but that's a biggish change
export function getSorts(
  instance: DuckPlot,
  columns?: string[],
  inputData?: Data
): Sorts {
  // Because the sort can be specified in the options, remove any colums who
  // have a sort specified
  const haveSorts = Object.keys(instance.mark()?.options?.sort ?? {});
  const currentColumns = columns
    ? columns
    : instance.data().types
    ? Object.keys(instance.data().types ?? {}).filter(
        (d) => d !== "fy" && !haveSorts.includes(d)
      )
    : [];
  const categoricalSeries = instance.color().options?.type === "categorical";

  const data = inputData ?? instance.data();
  return currentColumns
    .filter(
      (column) =>
        (data && data.types && data?.types[column] === "string") ||
        (column === "series" && categoricalSeries)
    )
    .reduce((acc: any, column) => {
      acc[column] = getDataOrder(data, column);
      return acc;
    }, {});
}

// TODO: type this
const defaultOptions = {
  width: 500,
  height: 281,
  color: defaultColors,
  fx: { label: null },
  className: "plot-chart",
  grid: false,
  style: {
    overflow: "visible",
  },
};

const defaultConfig = {
  xLabelDisplay: true,
  yLabelDisplay: true,
  tip: true,
};
// Get the top level configurations for the plot object
export function getPlotOptions(instance: DuckPlot) {
  const options = {
    ...defaultOptions,
    ...instance.derivePlotOptions(),
  };
  const config = { ...defaultConfig, ...instance.config() };
  const sorts = instance.sorts;
  const data = instance.data();
  const currentColumns = data?.types ? Object.keys(data.types ?? {}) : [];
  const markType = instance.mark().type;

  // Only compute a custom x/y domain if the other axes is missing
  // Make sure a minimum of 0 is included for x/y domains
  const xDomain = sorts?.x
    ? sorts.x
    : currentColumns.includes("y")
    ? {}
    : {
        domain: extent(
          [...data!, ...[data?.types?.x === "number" ? { x: 0 } : {}]],
          (d) => d.x
        ),
      };
  const yDomain = sorts?.y
    ? sorts.y
    : currentColumns.includes("x") || markType === "treemap"
    ? {}
    : {
        domain: extent(
          [...data!, ...[data?.types?.y === "number" ? { y: 0 } : {}]],
          (d) => d.y
        ),
      };

  // Handle 3 options for color: note, color as a string is assigned in the mark
  const { color: colorConfig } = options;
  const { domain: sortsDomainRaw } = sorts?.series || {};
  // If a domain ins't provided, use the data to determine the domain for
  // continuous series (e.g., numbers or dates). Note, this uses the full
  // dataset (not any filtered data from brushing)
  const sortsDomain = sortsDomainRaw
    ? sortsDomainRaw
    : data?.types?.series === "number" || data?.types?.series === "date"
    ? extent(
        [...data!, ...[data?.types?.series === "number" ? { series: 0 } : {}]],
        (d) => d.series
      )
    : undefined;

  let colorDomain, colorRange, colorScheme;
  // TODO this check seems off....
  const categoricalColor =
    data?.types?.series === "string" ||
    (!Array.isArray(options.color) && options.color.type === "categorical");
  // Array of strings is treated as the range
  if (Array.isArray(colorConfig)) {
    colorRange = colorConfig;
    colorDomain = sortsDomain;
  }
  // Object with optional values for domain, range, and scheme
  else if (
    typeof colorConfig === "object" &&
    (colorConfig.domain !== undefined ||
      colorConfig.range !== undefined ||
      colorConfig.scheme !== undefined)
  ) {
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

  const computedColor = hasColor
    ? {
        label: Array.isArray(options.color) ? "" : options.color.label,
        ...(colorDomain && { domain: colorDomain }),
        ...(colorRange && { range: colorRange }),
        ...(colorScheme && { scheme: colorScheme }),
      }
    : {};

  // TODO: fx labels are set to override x labels (good for grouped bar charts,
  // not good for other charts)
  const computedX =
    currentColumns.includes("fx") || markType === "treemap"
      ? { axis: null, ...xDomain }
      : {
          tickSize: 0,
          tickPadding: 5,
          ...(!config?.xLabelDisplay || !options.x?.label
            ? { labelArrow: "none" }
            : {}),
          ...(currentColumns.includes("x") &&
            getTickFormatter(
              data?.types?.x,
              "x",
              options.width || 0,
              options.height || 0
            )),
          ...xDomain,
        };
  const computedY =
    markType === "treemap"
      ? { axis: null }
      : {
          labelArrow:
            !config?.yLabelDisplay || !options.y?.label ? "none" : true,
          labelAnchor: "top",
          tickSize: 0,
          tickPadding: 5,
          ...(currentColumns.includes("y") &&
            getTickFormatter(
              data?.types?.y,
              "y",
              options.width || 0,
              options.height || 0
            )),
          ...yDomain,
        };

  return {
    ...options,
    x: {
      ...computedX,
      ...options.x,
      label: !config?.xLabelDisplay ? null : options.x?.label,
    },
    y: {
      ...computedY,
      ...options.y,
      label: !config?.yLabelDisplay ? null : options.y?.label,
    },
    color: { ...computedColor, ...options.color },
    ...(currentColumns.includes("fy")
      ? {
          fy: { ...sorts?.fy, axis: null, label: null, ...options.fy },
          insetTop: options.insetTop || 12,
        }
      : {}),
    // This is based on the assumption that fx comes from a groupedBar chart
    ...(currentColumns.includes("fx")
      ? { fx: { label: options.x?.label } }
      : {}),
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
  height: number
) {
  if (colType === "string") {
    return {
      tickFormat: (value: unknown) => {
        return truncateText(String(value), direction, width, height);
      },
    };
  }
  return {};
}

// Gets the type of legend to handle rendering
export function getLegendType(
  data: Data
): "categorical" | "continuous" | undefined {
  if (!data.types) return;
  return data.types.series === "string" ? "categorical" : "continuous";
}

// TODO: input options type
export function getCommonMarks(currentColumns: string[], inputOptions?: any) {
  const options = { ...borderOptions, ...inputOptions };
  return [
    Plot.frame({
      stroke: options.borderColor,
      // fill: options.background,
      rx: 4,
      ry: 4,
      ...(currentColumns.includes("fx") ? { facet: "super" } : {}),
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

export function getfyMarks(
  data: Data,
  currentColumns: string[],
  options: PlotOptions["fy"]
) {
  return currentColumns.includes("fy") &&
    !(Array.isArray(options?.ticks) && options?.ticks.length === 0)
    ? [
        Plot.text(
          data,
          Plot.selectFirst({
            text: (d) => d.fy,
            fy: (d) => d.fy,
            frameAnchor: "top-left",
            fyAnchor: "left",
            dy: 3,
            dx: 3,
          })
        ),
      ]
    : [];
}

// Directly using the code from Observable Plot
// https://github.com/observablehq/plot/blob/d2afa58db80bbb0365229a7c66ab016a5214fb0d/src/options.js#L519
const namedColors = new Set(
  "none,currentcolor,transparent,aliceblue,antiquewhite,aqua,aquamarine,azure,beige,bisque,black,blanchedalmond,blue,blueviolet,brown,burlywood,cadetblue,chartreuse,chocolate,coral,cornflowerblue,cornsilk,crimson,cyan,darkblue,darkcyan,darkgoldenrod,darkgray,darkgreen,darkgrey,darkkhaki,darkmagenta,darkolivegreen,darkorange,darkorchid,darkred,darksalmon,darkseagreen,darkslateblue,darkslategray,darkslategrey,darkturquoise,darkviolet,deeppink,deepskyblue,dimgray,dimgrey,dodgerblue,firebrick,floralwhite,forestgreen,fuchsia,gainsboro,ghostwhite,gold,goldenrod,gray,green,greenyellow,grey,honeydew,hotpink,indianred,indigo,ivory,khaki,lavender,lavenderblush,lawngreen,lemonchiffon,lightblue,lightcoral,lightcyan,lightgoldenrodyellow,lightgray,lightgreen,lightgrey,lightpink,lightsalmon,lightseagreen,lightskyblue,lightslategray,lightslategrey,lightsteelblue,lightyellow,lime,limegreen,linen,magenta,maroon,mediumaquamarine,mediumblue,mediumorchid,mediumpurple,mediumseagreen,mediumslateblue,mediumspringgreen,mediumturquoise,mediumvioletred,midnightblue,mintcream,mistyrose,moccasin,navajowhite,navy,oldlace,olive,olivedrab,orange,orangered,orchid,palegoldenrod,palegreen,paleturquoise,palevioletred,papayawhip,peachpuff,peru,pink,plum,powderblue,purple,rebeccapurple,red,rosybrown,royalblue,saddlebrown,salmon,sandybrown,seagreen,seashell,sienna,silver,skyblue,slateblue,slategray,slategrey,snow,springgreen,steelblue,tan,teal,thistle,tomato,turquoise,violet,wheat,white,whitesmoke,yellow".split(
    ","
  )
); // prettier-ignore

// Returns true if value is a valid CSS color string. This is intentionally lax
// because the CSS color spec keeps growing, and we don’t need to parse these
// colors—we just need to disambiguate them from column names.
// https://www.w3.org/TR/SVG11/painting.html#SpecifyingPaint
// https://www.w3.org/TR/css-color-5/
export function isColor(value?: ColumnType) {
  if (typeof value !== "string") return false;
  value = value.toLowerCase().trim();
  return (
    /^#[0-9a-f]{3,8}$/.test(value) || // hex rgb, rgba, rrggbb, rrggbbaa
    /^(?:url|var|rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color|color-mix)\(.*\)$/.test(
      value
    ) || // <funciri>, CSS variable, color, etc.
    namedColors.has(value) // currentColor, red, etc.
  );
}
