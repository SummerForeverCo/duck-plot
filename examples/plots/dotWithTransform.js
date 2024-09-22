import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `duckplot
    .query("select * from income USING sample 100")
    .table("income")
    .x("month")
    .y(["execution_income", "consensus_income"])
    .r("validator")
    .mark("dot", {opacity: .5})
    .options({
        r: {
            type: "pow",            
            range: [2, 10 ]
        }
    })
    `;

export const dotWithTransform = (options) =>
  renderPlot("income.csv", codeString, options);
