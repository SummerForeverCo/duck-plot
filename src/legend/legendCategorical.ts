import type { DuckPlot } from "..";
import { ChartType } from "../types";

export interface Category {
  name: string;
  color: string;
}

export async function legendCategorical(
  instance: DuckPlot
): Promise<HTMLDivElement> {
  const document = instance.document;
  const categories = Array.from(
    instance.plotObject?.scale("color")?.domain ?? []
  )?.map((d) => `${d}`);

  // Get the symbols for each category
  const symbols = categories.map((category) => {
    if (!instance.markColumn().column) return instance.mark().type;
    const data = instance.data();
    // == as this has been stringified above
    const symbol = data.find((d) => d.series == category)?.markColumn;
    return symbol;
  });

  function isActive(category: string): boolean {
    return (
      instance.visibleSeries.length === 0 ||
      instance.visibleSeries.includes(category)
    );
  }

  const colors = Array.from(instance.plotObject?.scale("color")?.range ?? []);
  const options = await instance.derivePlotOptions();
  const width = options.width || 500;
  const height = options.height || 300;
  const label = options.color?.label;

  const font = instance.font;

  // Create a hidden container for measurement
  const hiddenContainer = document.createElement("div");
  hiddenContainer.style.position = "absolute";
  hiddenContainer.style.visibility = "hidden";
  hiddenContainer.style.height = "0";
  hiddenContainer.style.overflow = "hidden";
  document.body.appendChild(hiddenContainer);

  const legend = document.createElement("div");
  const container = document.createElement("div");
  container.style.maxWidth = `${width}px`;
  container.className = "dp-categories-container";
  if (label) {
    const legendLabel = document.createElement("div");
    legendLabel.className = "dp-legend-label";
    legendLabel.innerHTML = label || "";
    legend.appendChild(legendLabel);
  }

  const categoriesDiv = document.createElement("div");
  categoriesDiv.className = "dp-categories";

  // Stylize and add active class
  categories.forEach((category, i) => {
    const categoryDiv = document.createElement("div");
    categoryDiv.className = `dp-category${
      isActive(category) ? "" : " dp-inactive"
    }`;

    const symbolType = symbols[i];
    const symbol = drawSymbol(symbolType, colors[i % colors.length], document);
    categoryDiv.appendChild(symbol);

    const textNode = document.createTextNode(category);
    categoryDiv.appendChild(textNode);

    categoryDiv.setAttribute("data-tooltip", category); // Tooltip
    categoriesDiv.appendChild(categoryDiv);
  });

  // Hold collapsed categories
  const collapsedCategoriesDiv = document.createElement("div");
  collapsedCategoriesDiv.className = "dp-collapsed-categories";

  const popoverDiv = document.createElement("div");
  popoverDiv.className = "dp-popover";
  popoverDiv.id = "dp-popover";

  container.appendChild(categoriesDiv);
  container.appendChild(collapsedCategoriesDiv);
  container.appendChild(popoverDiv);

  hiddenContainer.appendChild(container);
  updateLegendDisplay(container, font);
  hiddenContainer.remove();
  legend.appendChild(container);
  // Apply click event listeners
  if (instance.config().interactiveLegend !== false && !instance.isServer) {
    collapsedCategoriesDiv.addEventListener("click", () =>
      showPopover(container, height)
    );
    const legendElements = legend.querySelectorAll<HTMLElement>(".dp-category");

    legendElements.forEach((element: SVGElement | HTMLElement) => {
      const elementId = `${element.textContent}`; // stringify in case of numbers as categories
      if (!elementId) return;
      element.style.cursor = "pointer";
      element.addEventListener("click", (event) => {
        const mouseEvent = event as MouseEvent;
        // Shift-click: hide all others
        if (mouseEvent.shiftKey) {
          // If this is the only visible element, reset all to visible
          if (instance.visibleSeries.length === 1 && isActive(elementId)) {
            instance.visibleSeries = [];
          } else {
            instance.visibleSeries = [elementId]; // show only this one
          }
        } else {
          // Regular click: toggle visibility of the clicked element
          if (isActive(elementId)) {
            const currentSeries = instance.visibleSeries.length
              ? instance.visibleSeries
              : categories;
            instance.visibleSeries = currentSeries.filter(
              (id) => id !== elementId
            ); // Hide the clicked element
          } else {
            instance.visibleSeries.push(elementId); // Show the clicked element
          }
        }
        // Update the active state of the items in the legend
        legendElements.forEach((e) => {
          if (isActive(`${e.textContent}`)) {
            e.classList.remove("dp-inactive");
          } else {
            e.classList.add("dp-inactive");
          }
        });
        // Rerender the plot, but not the legend itself
        instance.render(false);
      });
    });
  }
  return legend;
}

// Measurement differes between server and client
const getWidth = function (element: HTMLDivElement, font: any): number {
  if (font && font.getAdvanceWidth) {
    const width = font.getAdvanceWidth(element.textContent || "", 10) + 12 + 12;
    return width;
  } else {
    const width = element.offsetWidth;
    return width;
  }
};

function updateLegendDisplay(container: HTMLDivElement, font: any): void {
  // Select the category containers
  const legendContainer = container.querySelector(
    ".dp-categories"
  ) as HTMLDivElement;

  // Select the collapsed categories and popover
  const collapsedCategories = container.querySelector(
    ".dp-collapsed-categories"
  ) as HTMLDivElement;
  const popover = container.querySelector(".dp-popover") as HTMLDivElement;

  const containerWidth = +(container.style.maxWidth.replace("px", "") || 0);
  let categoriesWidth = 30; // Start with some padding
  let visibleCount = 0;

  const categoryDivs = legendContainer.querySelectorAll(
    ".dp-category"
  ) as NodeListOf<HTMLDivElement>;
  popover.innerHTML = ""; // Clear previous popover items

  // Reset visibility
  categoryDivs.forEach((category) => {
    category.style.display = "flex";
  });

  // Calculate how many categories can fit
  categoryDivs.forEach((category, i) => {
    categoriesWidth += getWidth(category, font);
    if (categoriesWidth > containerWidth) {
      // Move element to popover
      category.style.borderRight = "none";
      popover.appendChild(category);
    } else {
      visibleCount++;
    }
  });

  // Handle collapsed categories
  const totalCategories = categoryDivs.length;
  if (visibleCount < totalCategories) {
    collapsedCategories.style.display = "flex";
    collapsedCategories.style.whiteSpace = "nowrap";
    collapsedCategories.textContent = `+${totalCategories - visibleCount} more`;
    // Check to see if the collapsed category now exceeds the width
    const collapsedWidth = getWidth(collapsedCategories, font);
    // If it does, move the last visible category to the collapsed section and
    // update the text
    if (collapsedWidth + categoriesWidth > containerWidth) {
      const lastVisibleCategory = categoryDivs[visibleCount - 1];
      lastVisibleCategory.style.borderRight = "none";
      collapsedCategories.textContent = `+${
        totalCategories - visibleCount + 1
      } more`;
      popover.appendChild(lastVisibleCategory); // Move it to the collapsed section
    }
  } else {
    collapsedCategories.style.display = "none";
  }
}

function showPopover(container: HTMLDivElement, height: number): void {
  const popover = container.querySelector(".dp-popover") as HTMLDivElement;
  if (popover.style.display === "block") {
    popover.style.display = "none";
  } else {
    // TODO: Move some to CSS
    popover.style.display = "block";
    popover.style.position = "absolute";
    popover.style.backgroundColor = "white";
    popover.style.right = `0px`;
    popover.style.top = `30px`;
    popover.style.maxHeight = `${height}px`;
    popover.style.overflowY = `auto`;
  }
}
function drawSymbol(
  symbolType: ChartType,
  color: string,
  document: Document
): HTMLElement {
  const symbol = document.createElement("div");
  symbol.style.backgroundColor = color;
  symbol.style.width = "12px";
  switch (symbolType) {
    case "dot":
      symbol.style.height = "12px";
      symbol.style.borderRadius = "12px";
      symbol.style.border = "1px solid rgba(0,0,0, .16)";
      return symbol;
    case "line":
      symbol.style.height = "0px"; // Use border for the line thickness
      symbol.style.borderTop = "2px solid rgba(0,0,0, .16)"; // Define line thickness
      return symbol;
    default:
      symbol.style.height = "12px";
      symbol.style.borderRadius = "2px";
      symbol.style.border = "1px solid rgba(0,0,0, .16)";
      return symbol;
  }
}
