import container from "markdown-it-container";

export default function csvPreview(md) {
  md.use(container, "csv-preview", {
    render(tokens, idx) {
      if (tokens[idx].nesting === 1) {
        let content = "";

        // Collect content from inline tokens (the actual text inside the container)
        for (let i = idx + 1; i < tokens.length; i++) {
          const token = tokens[i];
          if (token.type === "container_csv-preview_close") break;

          // Check for inline tokens that contain the actual text content
          if (token.type === "inline") {
            content += token.content;
          }
        }

        // Escape and format content as a prop
        const escapedContent = JSON.stringify(content.trim());
        return `<CSVPreview :fileName=${md.utils.escapeHtml(
          escapedContent
        )} />`;
      }

      // Return an empty string for the closing tag
      return "";
    },
  });
}
