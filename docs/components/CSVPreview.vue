<template>
  <div>
    <table v-if="rows.length">
      <thead>
        <tr>
          <th v-for="header in headers" :key="header">{{ header }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in rowsWithEllipsis" :key="rowIndex">
          <td v-for="header in headers" :key="header">
            <!-- Display ellipses if it's the last row, otherwise show the actual value -->
            {{ row.isEllipsis ? "..." : row[header] }}
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>Loading data...</p>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  props: {
    fileName: {
      type: String,
      required: true,
    },
    columns: {
      type: Array,
      required: false,
    },
  },
  data() {
    return {
      headers: [], // Column headers
      rows: [], // Table rows
    };
  },
  computed: {
    rowsWithEllipsis() {
      // Return all rows as is, except the last one, which will display ellipses
      return this.rows.map((row, index) => ({
        ...row,
        isEllipsis: index === this.rows.length - 1, // Set a flag for the last row
      }));
    },
  },
  mounted() {
    this.loadCsvData(this.fileName);
  },
  methods: {
    async loadCsvData(file) {
      try {
        // Fetch and parse the CSV file using d3.csv
        const rawData = await d3.csv(file);
        const data = this.columns
          ? rawData.map((row) =>
              this.columns.reduce(
                (acc, key) => ({ ...acc, [key]: row[key] }),
                {}
              )
            )
          : rawData;

        // Store headers and first 5 rows of data, with the last row showing ellipses
        this.headers = Object.keys(data[0]);
        this.rows = data.slice(0, 5);
      } catch (error) {
        console.error("Error loading CSV:", error);
      }
    },
  },
};
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 8px;
  text-align: left;
  border: 1px solid #ddd;
}
th {
  background-color: #f2f2f2;
}
</style>
