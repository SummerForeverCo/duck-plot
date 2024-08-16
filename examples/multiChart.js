import { DuckPlot } from "../dist/index.cjs";
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
  const db = await createDb("taxi.csv");
  const duckPlot = new DuckPlot(db, { jsdom, font });

  duckPlot
    .table("taxi")
    .columns({ x: "date", y: "count", series: "Borough" })
    .type("line");
  const line = await duckPlot.render();
  savePlot(jsdom, line, "line");

  // Update the config
  duckPlot.config({
    xLabelDisplay: false,
    yLabel: "Taxi rides by borough",
  });
  const labeled = await duckPlot.render();
  savePlot(jsdom, labeled, "labeled");

  duckPlot
    .table("taxi")
    .columns({ x: "Borough", y: "Count", series: "Borough" }) // Columns of interest
    .config({ width: 400, xLabel: null })
    .type("barY");

  const series = await duckPlot.render();
  savePlot(jsdom, series, "series");
}
makePlots();

function savePlot(jsdom, chart, name) {
  jsdom.window.document.body.innerHTML = "";
  jsdom.window.document.body.appendChild(chart);
  // Write the generated HTML content
  const outputPath = `examples/server-output/${name}.html`;
  fs.writeFileSync(outputPath, jsdom.serialize());
}
