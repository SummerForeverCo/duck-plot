import { DuckPlot } from "../dist/duck-plot.es";
import { incomePlot } from "./plots/income.js";

const duckPlot = new DuckPlot();
// TODO: all the plots!
incomePlot(duckPlot).then((plt) => {
  document.body.appendChild(plt);
});
