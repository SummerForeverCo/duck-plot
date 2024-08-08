import { DuckPlot } from "../dist/duck-plot.es";
import * as plots from "./plots/index.js";

// Running async so the plots can be rendered in order
async function renderPlots() {
  const sortedPlots = Object.entries(plots).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  for (const [name, plot] of sortedPlots) {
    const duckPlot = new DuckPlot();
    try {
      const plt = await plot(duckPlot);
      const label = document.createElement("h2");
      label.innerHTML = name;
      label.style.fontFamily = "sans-serif";
      label.style.fontWeight = "normal";
      document.body.appendChild(label);

      const wrapper = document.createElement("div");
      wrapper.style.display = "flex";
      const plotWrapper = document.createElement("div");
      plotWrapper.style.width = "50%";
      plotWrapper.appendChild(plt[0]);
      wrapper.appendChild(plotWrapper);

      const pre = document.createElement("pre");
      pre.style.backgroundColor = "#f4f4f4";
      pre.style.padding = "10px";
      pre.style.borderRadius = "5px";
      pre.style.whiteSpace = "break-spaces";
      pre.style.width = "50%";
      pre.innerHTML = plt[1];
      wrapper.appendChild(pre);

      document.body.appendChild(wrapper);
    } catch (error) {
      console.error(`Error rendering plot ${name}:`, error);
    }
  }
}

// Call the function to render plots
renderPlots();
