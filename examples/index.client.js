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
document.body.style.fontFamily = "sans-serif";
// Running async so the plots can be rendered in order
async function renderPlots() {
  const sortedPlots = Object.entries(plots).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  for (const [name, plot] of sortedPlots) {
    try {
      let ssrChart;
      await fetch(`server-output/${name}.html`, { cache: "no-store" })
        .then((response) => response.text())
        .then((data) => {
          // Vite returns the fallback index.html if the file is not found
          if (data.includes("<title>DuckPlot Demos</title>")) {
            ssrChart = `<p>Run <code>npm run dev-server</code> to generate the server rendered charts</p>`;
          } else {
            // Parse the fetched HTML string
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, "text/html");

            // Extract the body content
            const bodyContent = doc.body.innerHTML;
            ssrChart = bodyContent;
          }
        })
        .catch((error) => console.error("Error fetching HTML:", error));

      // Wrapper for charts and code
      const wrapper = document.createElement("div");
      wrapper.style.display = "flex";
      const label = document.createElement("h2");
      label.innerHTML = name;
      label.style.fontWeight = "normal";
      document.body.appendChild(label);

      // Client render the plot
      const plt = await plot();
      const plotWrapper = document.createElement("div");
      const clientLabel = document.createElement("text");
      clientLabel.innerHTML = "Client rendered";
      clientLabel.style.fontWeight = "bold";
      clientLabel.style.opacity = ".5";
      plotWrapper.appendChild(clientLabel);
      plotWrapper.style.width = "50%";
      plotWrapper.appendChild(plt[0]);
      wrapper.appendChild(plotWrapper);

      // Code section
      const pre = document.createElement("pre");
      pre.style.border = "1px solid";
      pre.style.padding = "10px";
      pre.style.borderRadius = "5px";
      pre.style.whiteSpace = "break-spaces";
      pre.style.width = "100%";
      pre.innerHTML = plt[1];
      document.body.appendChild(pre);

      // Server rendered chart
      const ssrWrapper = document.createElement("div");
      const serverLabel = document.createElement("text");
      serverLabel.style.fontWeight = "bold";
      serverLabel.style.opacity = ".5";
      serverLabel.innerHTML = "Server Rendered";
      ssrWrapper.appendChild(serverLabel);
      ssrWrapper.style.width = "50%";
      const ssrDiv = document.createElement("div");
      ssrDiv.innerHTML = ssrChart;
      ssrWrapper.appendChild(ssrDiv);

      wrapper.appendChild(ssrWrapper);
      document.body.appendChild(wrapper);
    } catch (error) {
      console.error(`Error rendering plot ${name}:`, error);
    }
  }
}

// Call the function to render plots
renderPlots();
