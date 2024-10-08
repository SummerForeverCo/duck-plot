import { defaultColors } from "./getPlotOptions";

export interface Category {
  name: string;
  color: string;
}

export function legendCategorical(
  document: Document,
  categories: string[],
  visibleCategories: string[],
  colors: string[],
  width: number,
  height: number,
  label?: string,
  font?: any // for measuring text width on the server
): HTMLDivElement {
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

  categories.forEach((category, i) => {
    const categoryDiv = document.createElement("div");
    categoryDiv.className = `dp-category${
      visibleCategories.includes(category) ? "" : " dp-inactive"
    }`;

    const square = document.createElement("div");
    square.style.backgroundColor = colors[i % colors.length];
    square.style.width = "12px";
    square.style.height = "12px";
    square.style.borderRadius = "5px";
    square.style.border = "1px solid rgba(0,0,0, .16)";
    categoryDiv.appendChild(square);

    const textNode = document.createTextNode(category);
    categoryDiv.appendChild(textNode);

    categoryDiv.setAttribute("data-tooltip", category); // Tooltip
    categoriesDiv.appendChild(categoryDiv);
  });

  const collapsedCategoriesDiv = document.createElement("div");
  collapsedCategoriesDiv.className = "dp-collapsed-categories";
  collapsedCategoriesDiv.addEventListener("click", () =>
    showPopover(container, height)
  );

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
  return legend;
}

function updateLegendDisplay(container: HTMLDivElement, font: any): void {
  // Measurement differes between server and client
  const getWidth = function (element: HTMLDivElement): number {
    if (font && font.getAdvanceWidth) {
      const width =
        font.getAdvanceWidth(element.textContent || "", 10) + 12 + 12;
      return width;
    } else {
      const width = element.offsetWidth;
      return width;
    }
  };
  const categoriesDiv = container.querySelector(
    ".dp-categories"
  ) as HTMLDivElement;
  const collapsedCategories = container.querySelector(
    ".dp-collapsed-categories"
  ) as HTMLDivElement;
  const popover = container.querySelector(".dp-popover") as HTMLDivElement;

  const containerWidth = +(container.style.maxWidth.replace("px", "") || 0);
  let categoriesWidth = 0;
  let visibleCount = 0;

  const categoryDivs = categoriesDiv.querySelectorAll(
    ".dp-category"
  ) as NodeListOf<HTMLDivElement>;
  popover.innerHTML = ""; // Clear previous popover items

  // Reset visibility
  categoryDivs.forEach((category) => {
    category.style.display = "flex";
  });

  // Calculate how many categories can fit
  categoryDivs.forEach((category, i) => {
    categoriesWidth += getWidth(category) + 10; // Adding gap
    if (categoriesWidth > containerWidth) {
      // category.style.display = "none";

      // Add to popover
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
    collapsedCategories.textContent = `+${totalCategories - visibleCount} more`;
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
