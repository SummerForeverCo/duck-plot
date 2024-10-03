// Event handler for the hover event
import * as Plot from "@observablehq/plot";
import { ChartType } from "./types";

// TODO more specific elementType
export function focusSeries(
  event: MouseEvent,
  plot: (HTMLElement | SVGSVGElement) & Plot.Plot,
  elementType: string,
  type: ChartType,
  otherOpacity: string
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
    if (label === hoveredAriaLabel) {
      // Move the hovered element to the front
      element.parentNode?.appendChild(element);
      element.style[`${colorType}Opacity`] = "1";
    } else {
      element.style[`${colorType}Opacity`] = otherOpacity;
    }
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
