import * as Plot from "@observablehq/plot";
import type { PlotOptions } from "@observablehq/plot";

export type AutoMarginOptions = {
  rotateX?: boolean;
  hideWarnings?: boolean;
  hideOverlapping?: boolean;
};

// The y nodes are nested differently sometimes (fx?), this should handle both cases
const yNodeSelector =
  'g[aria-label="y-axis tick label"][text-anchor="end"] text, ' + // Case where text-anchor is on the parent g
  'g[aria-label="y-axis tick label"] g[text-anchor="end"] text'; // Case where text-anchor is on a child g
const xNodeSelector =
  '[aria-label="x-axis tick label"] text, [aria-label="fx-axis tick label"] text, [aria-label="fx-axis tick label"] g text';

const yNodeRightSelector = yNodeSelector.replaceAll("end", "start");
export function PlotAutoMargin(
  // TODO: probably swap the name of options and config for consistency
  config: PlotOptions,
  options?: AutoMarginOptions,
  font?: any
): (SVGSVGElement | HTMLElement) & Plot.Plot {
  const getWidth = function (element: HTMLElement | SVGElement): number {
    if (font && font.getAdvanceWidth) {
      // Because the font can be in multiple lines in tspans, find the longest
      // tspan
      // Use a regular expression to match the content inside <tspan> tags
      const regex = /<tspan[^>]*>(.*?)<\/tspan>/g;

      // Extract the matches or default to the full string if no <tspan> tags are found
      let match;
      let longestString = "";
      let foundTspans = false;

      while ((match = regex.exec(element.innerHTML)) !== null) {
        foundTspans = true; // Flag that we found at least one <tspan>
        const content = match[1]; // match[1] contains the content between the <tspan> tags
        if (content.length > longestString.length) {
          longestString = content; // Update the longest string if this one is longer
        }
      }

      // If no <tspan> elements were found, treat the entire string as the content
      if (!foundTspans) {
        longestString = element.innerHTML;
      }

      const width = font.getAdvanceWidth(longestString || "", 10);
      return width;
    } else {
      const { width } = element.getBoundingClientRect();
      return width;
    }
  };

  // Default options
  const defaultOptions: AutoMarginOptions = {
    hideWarnings: true,
    rotateX: true,
    hideOverlapping: true,
  };

  // Merge user options with default options
  const { hideWarnings, rotateX, hideOverlapping } = {
    ...defaultOptions,
    ...options,
  };
  // Helper to compute the rotation
  function getRotation(nodes: NodeList, totalWidth: number) {
    if (!nodes) return 0;
    const maxWidth = Math.max(
      ...Array.from(nodes).map((node) => getWidth(node as HTMLElement))
    );

    const gap = 5;
    return maxWidth > totalWidth / nodes.length - gap ? -45 : 0;
  }

  // Helper to adjust visibility
  function adjustVisibility(nodes: NodeListOf<Element>, size: number) {
    const elementSize = 18;
    const numberToShow = Math.floor(size / elementSize);
    let showIndex = Math.ceil(nodes.length / numberToShow);
    Array.from(nodes).forEach((node, index) => {
      const element = node as HTMLElement;
      if (index % showIndex === 0) element.style.display = "";
      else element.style.display = "none";
    });
  }

  const initialPlot = Plot.plot(config);

  // If there's no font file for measurement, append the SVG to the DOM so we
  // can measure the text elements
  // Temporarily append the SVG to the DOM but keep it hidden
  if (!font) {
    initialPlot.style.position = "absolute";
    initialPlot.style.visibility = "hidden";
    document.body.appendChild(initialPlot);
  }
  // Extract the x-axis tick labels
  let xNodes = initialPlot.querySelectorAll(xNodeSelector);

  let yNodes = initialPlot.querySelectorAll(yNodeSelector);
  let yNodesRight = initialPlot.querySelectorAll(yNodeRightSelector);

  // Get the margin left to determine the full width for the x labels
  let maxYWidth = 0,
    maxYRightWidth = 0;
  yNodes.forEach((node) => {
    const computedWidth = getWidth(node as HTMLElement);
    maxYWidth = Math.max(maxYWidth, computedWidth + 10);
  });
  yNodesRight.forEach((node) => {
    const computedWidth = getWidth(node as HTMLElement);
    maxYRightWidth = Math.max(maxYRightWidth, computedWidth + 10);
  });
  // Get rotation angle
  const tickRotate = rotateX
    ? getRotation(xNodes, (config.width || 0) - (maxYWidth + maxYRightWidth))
    : 0;
  let maxHeight = 0;
  let maxWidthFromX = 0;
  // Get the max height and width to get the margin bottom
  xNodes.forEach((node) => {
    // Get the rotated height (will be the height if not rotated)
    // Count the number of tspans (for the case when there is a line break)
    const count = (node.innerHTML.match(/<tspan/g) || [""]).length;
    const height = 14 * count;
    const computedWidth = getWidth(node as HTMLElement);
    const theta = (tickRotate * Math.PI) / 180; // Convert degrees to radians
    const rotatedHeight = height + Math.abs(computedWidth * Math.sin(theta));

    maxHeight = Math.max(maxHeight, rotatedHeight);
    // Tracking the width as well to ensure we have enough margin LEFT
    const rotatedWidth = Math.abs(
      computedWidth * Math.cos(theta) + height * Math.sin(theta)
    );
    maxWidthFromX =
      tickRotate === 0 ? 0 : Math.max(maxWidthFromX, rotatedWidth);
  });
  let style = (config.style || {}) as Partial<CSSStyleDeclaration>;
  // Additional margin bottom for grouped bar charts
  let facet =
    "fx" in config
      ? {
          facet: { marginBottom: maxHeight + 15 },
        }
      : {};
  config = {
    ...config,
    marginBottom: maxHeight + 15,
    marginLeft: Math.max(maxWidthFromX, maxYWidth),
    marginRight: maxYRightWidth,
    insetTop: 0,
    x: {
      ...config.x,
      tickRotate,
      // If there is a second axis, center the x label
      ...(yNodesRight.length > 0 ? { labelAnchor: "center" } : {}),
    },
    fx: {
      ...config.fx,
      tickRotate,
    },
    y: {
      ...config.y,
    },
    style: {
      ...style,
      overflow: "visible",
    },
    ...facet,
  };

  const finalChart = Plot.plot(config);

  // Adjust the visibility of the x and y labels that may be overlapping
  if (hideOverlapping) {
    xNodes = finalChart.querySelectorAll(xNodeSelector);

    yNodes = finalChart.querySelectorAll(yNodeSelector);
    yNodesRight = finalChart.querySelectorAll(yNodeRightSelector);
    const fyNodes = finalChart.querySelectorAll('[aria-label="text"] g text');
    adjustVisibility(fyNodes, config.height! - (config.marginBottom || 0));
    adjustVisibility(
      xNodes,
      config.width! - (config.marginLeft || 0) - (config.marginRight || 0)
    );
    adjustVisibility(yNodes, config.height! - (config.marginBottom || 0));
    adjustVisibility(yNodesRight, config.height! - (config.marginBottom || 0));
  }
  // Hide any plot warnings
  if (hideWarnings) {
    const elements = finalChart.querySelectorAll("title");

    const warning = Array.from(elements).find((element) =>
      element.textContent?.includes("Please check the console")
    );
    if (warning && warning.parentElement) {
      warning.parentElement.style.display = "none";
    }
  }
  if (!font) {
    document.body.removeChild(initialPlot);
  }
  return finalChart;
}
