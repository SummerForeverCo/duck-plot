import { DuckPlot } from "../dist/duck-plot.cjs";
import { JSDOM } from "jsdom";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { font } from "./util/loadedFont.js";
import { createDb } from "./util/createDb.js";

// Get the current file's directory using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the path to the CSS file located in ../dist/style.css
const cssPath = path.resolve(__dirname, "../dist/style.css");

// Read the CSS file content
const cssContent = fs.readFileSync(cssPath, "utf8");

const jsdom = new JSDOM(`
<!DOCTYPE html>
<head>
  <meta charset="UTF-8">
  <style>
    ${cssContent}
  </style>
</head>
<body></body>`);

async function makePlots() {
  const duckPlot = new DuckPlot({ jsdom, font });
  const db = await createDb("taxi.csv");

  duckPlot
    .data({ ddb: db, table: "taxi" })
    .columns({ x: "date", y: "count", series: "Borough" })
    .type("line");
  const line = await duckPlot.render();
  savePlot(jsdom, line, "line");

  // Update the config
  duckPlot.config({
    xLabel: null,
    yLabel: "Count",
    title: "Taxi rides by borough",
  });
  const labeled = await duckPlot.render();
  savePlot(jsdom, labeled, "labeled");
}
makePlots();

function savePlot(jsdom, chart, name) {
  jsdom.window.document.body.innerHTML = "";
  jsdom.window.document.body.appendChild(chart);
  // Write the generated HTML content
  const outputPath = `examples/server-output/${name}.html`;
  fs.writeFileSync(outputPath, jsdom.serialize());
}
