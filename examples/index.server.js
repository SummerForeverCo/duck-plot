import { DuckPlot } from "../dist/duck-plot.cjs";
import { JSDOM } from "jsdom";
import fs from "fs";
import * as plots from "./plots/index.js";
import { font } from "./util/loadedFont.js";
const jsdom = new JSDOM(`
<!DOCTYPE html>
<head><meta charset="UTF-8"></head>
<body><div></div></body>`);
for (const [name, plot] of Object.entries(plots)) {
  const duckPlot = new DuckPlot({ jsdom, font });
  console.log("generating", name);
  plot(duckPlot).then((plt) => {
    fs.writeFileSync(`examples/server-output/${name}.html`, plt[0].outerHTML);
  });
}
