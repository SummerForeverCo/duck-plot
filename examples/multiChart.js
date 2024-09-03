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

  duckPlot.table("taxi").x("date").y("count").mark("line");
  const line = await duckPlot.render();
  savePlot(jsdom, line, "line");

  // Adjust the labels and resave
  duckPlot
    .options({
      y: { label: "Taxi rides by borough" },
    })
    .config({ xLabelDisplay: false });
  const labeled = await duckPlot.render();
  savePlot(jsdom, labeled, "labeled");

  // Adjust the data and type and resave
  duckPlot
    .table("taxi")
    .x("date")
    .y("count")
    .color("borough")
    .options({ width: 400, x: { label: null } })
    .mark("barY");

  const series = await duckPlot.render();
  savePlot(jsdom, series, "series");

  // Without font
  const duckPlotNoFont = new DuckPlot(db, { jsdom });

  duckPlotNoFont
    .table("taxi")
    .x("date")
    .y("count")
    .color("borough")
    .mark("barY")
    .options({ width: 400, x: { label: null } });
  const noFont = await duckPlotNoFont.render();
  savePlot(jsdom, noFont, "noFont");
}
makePlots();

function savePlot(jsdom, chart, name) {
  jsdom.window.document.body.innerHTML = "";
  jsdom.window.document.body.appendChild(chart);
  // Write the generated HTML content
  const outputPath = `examples/server-output/${name}.html`;
  const outDir = path.resolve(__dirname, "examples/server-output");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  fs.writeFileSync(outputPath, jsdom.serialize());
}
