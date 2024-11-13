<template>
  <div class="code-display">
    <div v-for="(code, key) in codeObject" :key="key" class="code-section">
      <strong>{{ key }}:</strong>
      <pre class="language-sql">
        <code v-html="formatSQLCode(code)"></code>
      </pre>
    </div>
  </div>
</template>

<script>
import Prism from "prismjs";
import { format } from "sql-formatter";
import "prismjs/components/prism-sql";
import "prismjs/themes/prism-tomorrow.css";

export default {
  props: {
    codeObject: {
      type: Object,
      required: true,
    },
  },
  methods: {
    formatSQLCode(code) {
      const formattedCode = format(code);
      return Prism.highlight(formattedCode, Prism.languages.sql, "sql");
    },
  },
};
</script>

<style>
/* Custom styling for better readability in light mode */
/* Ensure unclassified text in code blocks has a darker color */
div.code-section code {
  color: #f3f3f3 !important; /* Darker color for text without specific token classes */
}
</style>
