import { DuckPlot } from "../dist/duck-plot.cjs";
import { incomePlot } from "./plots/income.js";
import { JSDOM } from "jsdom";
import fs from "fs";
const jsdom = new JSDOM(`
<!DOCTYPE html>
<head><meta charset="UTF-8"></head>
<body><div></div></body>`);
const duckPlot = new DuckPlot(jsdom);
// TODO: all the plots!
incomePlot(duckPlot).then((plt) => {
  fs.writeFileSync("examples/server-output/incomePlot.svg", plt.outerHTML);
});
