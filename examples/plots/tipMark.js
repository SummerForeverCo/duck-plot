import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const smileySVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14">
  <!-- Face -->
  <circle cx="7" cy="7" r="6" fill="yellow" stroke="black" stroke-width="1"/>
  <!-- Left Eye -->
  <circle cx="5" cy="5" r="1" fill="black"/>
  <!-- Right Eye -->
  <circle cx="9" cy="5" r="1" fill="black"/>
  <!-- Smile -->
  <path d="M4 9 Q7 12, 10 9" stroke="black" stroke-width="1" fill="none" stroke-linecap="round"/>
</svg>`;

const smileyDataURL = `data:image/svg+xml,${encodeURIComponent(smileySVG)}`;

const codeString = `duckplot
    .query('select * from stocks')
    .table("stocks")
    .color("Symbol")
    .y("Close")        
    .mark("pie")
    .config({tipMark: {type: "image", options: {src: () => "${smileyDataURL}"}}})
    `;

export const tipMark = (options) =>
  renderPlot("stocks.csv", codeString, options);
