import container from "markdown-it-container";

export default function test(md) {
  md.use(container, "test", {
    render(tokens, idx) {
      const token = tokens[idx + 1];
      const content = JSON.stringify(token?.content);

      if (content)
        return `<PlotFigure :codeString='${md.utils.escapeHtml(content)}' />`;
      return "";
    },
  });
}
