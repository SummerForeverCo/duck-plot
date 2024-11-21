import type { DuckPlot } from "..";

export async function renderError(instance: DuckPlot, error: any) {
  // Create a fallback element with the error message
  const document = instance.isServer
    ? instance.jsdom.window.document
    : window.document;
  const errorElement = document.createElement("div");

  errorElement.textContent = `Error rendering plot: ${
    error instanceof Error ? error.message : String(error)
  }`;

  return errorElement;
}
