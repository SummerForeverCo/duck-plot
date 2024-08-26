import * as Plot from "@observablehq/plot";
import type { PlotOptions } from "@observablehq/plot";

export type PlotFitOptions = {
  rotateX?: boolean;
  hideWarnings?: boolean;
  hideOverlapping?: boolean;
};

export function PlotFit(
  config: PlotOptions,
  options?: PlotFitOptions,
  font?: any
): (SVGSVGElement | HTMLElement) & Plot.Plot {
  const getWidth = function (element: HTMLElement | SVGElement): number {
    if (font && font.getAdvanceWidth) {
      const width = font.getAdvanceWidth(element.textContent || "", 10);
      return width;
    } else {
      const { width } = element.getBoundingClientRect();
      return width;
    }
  };

  // Default options
  const defaultOptions: PlotFitOptions = {
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
  let xNodes = initialPlot.querySelectorAll(
    '[aria-label="x-axis tick label"] text'
  );

  let yNodes = initialPlot.querySelectorAll(
    '[aria-label="y-axis tick label"] text'
  );

  // Get the margin left to determine the full width for the x labels
  let maxYWidth = 0;
  yNodes.forEach((node) => {
    const computedWidth = getWidth(node as HTMLElement);
    maxYWidth = Math.max(maxYWidth, computedWidth + 10);
  });
  // Get rotation angle
  const tickRotate = rotateX
    ? getRotation(xNodes, (config.width || 0) - maxYWidth)
    : 0;
  let maxHeight = 0;
  let maxWidthFromX = 0;
  // Get the max height and width to get the margin bottom
  xNodes.forEach((node) => {
    // Get the rotated height (will be the height if not rotated)
    const height = 14;
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
  config = {
    ...config,
    marginBottom: maxHeight + 15,
    marginLeft: Math.max(maxWidthFromX, maxYWidth),
    marginRight: 0,
    insetTop: 0,
    x: {
      ...config.x,
      tickRotate,
    },
    y: {
      ...config.y,
    },
    style: {
      ...style,
      overflow: "visible",
    },
  };
  const finalChart = Plot.plot(config);

  // Adjust the visibility of the x and y labels that may be overlapping
  if (hideOverlapping) {
    xNodes = finalChart.querySelectorAll(
      '[aria-label="x-axis tick label"] text'
    );
    yNodes = finalChart.querySelectorAll(
      '[aria-label="y-axis tick label"] text'
    );
    const facetNodes = finalChart.querySelectorAll(
      '[aria-label="text"] g text'
    );
    adjustVisibility(facetNodes, config.height! - (config.marginBottom || 0));
    adjustVisibility(xNodes, config.width! - (config.marginLeft || 0));
    adjustVisibility(yNodes, config.height! - (config.marginBottom || 0));
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
