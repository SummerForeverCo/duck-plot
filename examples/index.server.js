import { DuckPlot } from "../dist/duck-plot.cjs";
import { JSDOM } from "jsdom";
import fs from "fs";
import * as plots from "./plots/index.js";
const jsdom = new JSDOM(`
<!DOCTYPE html>
<head><meta charset="UTF-8"></head>
<body><div></div></body>`);
for (const [name, plot] of Object.entries(plots)) {
  const duckPlot = new DuckPlot(jsdom);
  console.log("generating", name);
  plot(duckPlot).then((plt) => {
    fs.writeFileSync(`examples/server-output/${name}.svg`, plt[0].outerHTML);
  });
}
