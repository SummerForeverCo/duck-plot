// renderPlotClient.js
import { createDb } from "./createDb.js";
export async function renderPlot(duckplot, fileName, codeString) {
  try {
    const db = await createDb(fileName);
    Function("duckplot", "db", codeString)(duckplot, db);
    const plot = await duckplot.plot();
    return [plot, codeString];
  } catch (error) {
    console.error("Error creating plot:", error);
    return [null, codeString];
  }
}
