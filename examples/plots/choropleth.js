import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `duckplot 
    .table("uspop")
    .x('area')
    .y("population")
    .mark("geo")
    .options({width: 500, height: 500})    
    `;

export const choropleth = (options) =>
  renderPlot("uspop.csv", codeString, options);
