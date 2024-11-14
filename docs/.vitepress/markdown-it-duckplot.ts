import container from "markdown-it-container";

export default function duckplot(md) {
  md.use(container, "duckplot", {
    render(tokens, idx) {
      const token = tokens[idx + 1];
      const content = JSON.stringify(token?.content);

      if (content)
        return `<DuckPlotFigure :codeString='${md.utils.escapeHtml(
          content
        )}' />`;
      return "";
    },
  });
}
