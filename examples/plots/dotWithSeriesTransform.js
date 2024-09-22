import { renderPlot } from "../util/renderPlotClient.js";
// This code is both displayed in the browser and executed
const codeString = `duckplot
    .query('select *, execution_income as fake_column from income USING sample 100')
    .table("income")
    .x("month")
    .y(["execution_income", "consensus_income"])
    .color("validator")
    .r("fake_column")
    .mark("dot", {opacity: .5})
    .options({
        r: {
            type: "pow",            
            range: [2, 10 ]
        }
    })
    `;

export const dotWithSeriesTransform = (options) =>
  renderPlot("income.csv", codeString, options);
