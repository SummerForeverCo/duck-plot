import { DuckPlot } from "../dist/duck-plot.es";
import * as plots from "./plots/index.js";

// TODO: all the plots!
for (const [name, plot] of Object.entries(plots)) {
  const duckPlot = new DuckPlot();
  plot(duckPlot).then((plt) => {
    const label = document.createElement("h2");
    label.innerHTML = name;
    label.style.fontFamily = "sans-serif";
    label.style.fontWeight = "normal";
    document.body.appendChild(label);
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.appendChild(plt[0]);
    const pre = document.createElement("pre");
    pre.style.backgroundColor = "#f4f4f4";
    pre.style.padding = "10px";
    pre.style.borderRadius = "5px";
    pre.innerHTML = plt[1];
    wrapper.appendChild(pre);
    document.body.appendChild(wrapper);
  });
}
