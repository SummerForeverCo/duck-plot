import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `// Standard area chart
duckplot
  .table("stocks")
  .x("Date")
  .y("Open")
  .color("Symbol")
  .mark("areaY")
  .config({
    xLabelDisplay: false,         
    tipLabels: {        
        x: "This really long value will get truncated",    
    },
    tipValues: {        
        y: d => \`The value was \${Math.floor(d.y)}\`
    },
    autoMargin: false,    
    interactiveLegend: false,
    percent: true
    // aggregate - not shown
  })
`;

export const configOptions = (options) =>
  renderPlot("stocks.csv", codeString, options);
