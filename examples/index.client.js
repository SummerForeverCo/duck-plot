import { DuckPlot } from "../dist/index.es";
import "../dist/style.css";
import * as plots from "./plots/index.js";

// Add a dark mode toggle
const darkModeToggle = document.createElement("button");
darkModeToggle.innerHTML = "Toggle Dark Mode";
darkModeToggle.style.cursor = "pointer";
let darkMode = false;
darkModeToggle.onclick = () => {
  darkMode = !darkMode;
  const backgroundColor = darkMode ? "black" : "white";
  const color = darkMode ? "white" : "black";
  document.body.style.backgroundColor = backgroundColor;
  document.body.style.color = color;
};
document.body.append(darkModeToggle);
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
      pre.style.border = "1px solid";
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
