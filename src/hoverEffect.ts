// Event handler for the hover event
import * as Plot from "@observablehq/plot";
import { ChartType } from "./types";

// TODO more specific elementType
export function mouseEnter(
  event: MouseEvent,
  plot: (HTMLElement | SVGSVGElement) & Plot.Plot,
  elementType: string,
  type: ChartType
) {
  // Get the hovered element
  const hoveredElement = event.target as SVGElement;
  if (!hoveredElement) return;

  // We assign elements a label of the color for selection
  const hoveredAriaLabel = hoveredElement.getAttribute("aria-label");

  const colorType =
    type === "line" || type.startsWith("rule") || type.startsWith("tick")
      ? "stroke"
      : "fill";

  // Select all rect elements
  const elements: NodeListOf<SVGElement> = plot.querySelectorAll(elementType);

  // Iterate over all rect elements
  elements.forEach((element: SVGElement) => {
    // Get the aria-label of each rect
    const label: string | null = element.getAttribute("aria-label");
    if (label === null) return;
    // Compare the aria-label with the hovered rect's aria-label
    element.style[`${colorType}Opacity`] =
      label !== hoveredAriaLabel ? "0.3" : "1";
    element.style.zIndex = label !== hoveredAriaLabel ? "-1" : "1";
  });
}

export function mouseOut(
  event: MouseEvent,
  plot: (HTMLElement | SVGSVGElement) & Plot.Plot,
  elementType: string,
  type: ChartType
) {
  // Get the hovered element
  const hoveredElement = event.target as SVGElement;
  if (!hoveredElement) return;

  const colorType =
    type === "line" || type.startsWith("rule") || type.startsWith("tick")
      ? "stroke"
      : "fill";

  // Select all rect elements
  const elements: NodeListOf<SVGElement> = plot.querySelectorAll(elementType);

  // Iterate over all rect elements
  elements.forEach((element: SVGElement) => {
    // Get the aria-label of each rect
    const label: string | null = element.getAttribute("aria-label");
    // Compare the aria-label with the hovered rect's aria-label
    element.style[`${colorType}Opacity`] = "1";
    // Reset z index
    element.style.zIndex = "1";
  });
}

export function getElementType(markType: string) {
  let elementType: string;
  // TODO: add more mark types
  if (markType === "barY" || markType === "barX") {
    elementType = "rect";
  } else if (markType === "areaY" || markType === "line") {
    elementType = "path";
  } else if (markType === "dot") {
    elementType = "circle";
  } else {
    elementType = markType;
  }
  return elementType;
}
