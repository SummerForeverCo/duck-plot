import { JSDOM } from "jsdom";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as plots from "./plots/index.js";
import { font } from "./util/loadedFont.js";

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

const outDir = path.resolve(__dirname, "server-output");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
for (const [name, plot] of Object.entries(plots)) {
  try {
    // Wrap the plot function call and the rest of the operations in a try block
    const plt = await plot({ jsdom, font });
    // Clear the body content before generating a new plot
    jsdom.window.document.body.innerHTML = "";

    // Append the plot to the body
    if (plt && plt[0]) {
      jsdom.window.document.body.appendChild(plt[0]);
    } else {
      throw new Error("Plot rendering returned an unexpected result");
    }

    // Write the generated HTML content
    const outputPath = `examples/server-output/${name}.html`;
    fs.writeFileSync(outputPath, jsdom.serialize());
    console.log(`Generated file: ${outputPath}`);
  } catch (error) {
    console.error(`Error processing plot '${name}':`, error);
  }
}
