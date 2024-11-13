<template>
  <div>
    <!-- Conditionally render the CodeDisplay component -->
    <CodeDisplay v-if="showQueries" :codeObject="queries" />
    <div v-else-if="showDescribe">
      <strong
        ><em class="callout-tip">
          {{ description }}
        </em></strong
      >
    </div>
    <!-- Render the plot if showQueries is false -->
    <div v-else ref="plotContainer"></div>
  </div>
</template>
<script>
import CodeDisplay from "./CodeDisplay.vue";
import * as duckdb from "@duckdb/duckdb-wasm";
import * as Plot from "@observablehq/plot";
import { DuckPlot } from "../../dist/index.es";
import "../../dist/style.css";
import mvp_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url";
import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";
export const createDbClient = async (fileName) => {
  const tableName = fileName.replace(".csv", "").replace("-", "");

  const bundle = await duckdb.selectBundle({
    mvp: { mainModule: duckdb_wasm, mainWorker: mvp_worker },
  });
  const worker = new Worker(bundle.mainWorker);
  const logger = new duckdb.VoidLogger();
  const db = new duckdb.AsyncDuckDB(logger, worker);

  // await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker || undefined);
  const conn = await db.connect();

  // Fetch the CSV file from the Vite server
  const response = await fetch(`/data/${fileName}`);
  const csvData = await response.text();
  await db.registerFileText(`data.csv`, csvData);

  await conn.insertCSVFromPath("data.csv", {
    schema: "main",
    name: tableName,
    detect: true,
    header: true,
    delimiter: ",",
  });

  return db;
};

export default {
  props: ["codeString"],
  data() {
    return {
      plot: null, // Store the plot once it is ready
      queries: null, // Store the queries object for CodeDisplay
      showQueries: false, // Control whether to show CodeDisplay or the plot
      showDescribe: false,
    };
  },
  async mounted() {
    const tableNameMatch = this.codeString.match(/\.table\(["'`](\w+)["'`]\)/);
    const tableName = tableNameMatch ? tableNameMatch[1] : false;
    const isRawData = this.codeString.includes("rawData");
    if (tableName || isRawData) {
      const db = isRawData
        ? undefined
        : await createDbClient(`${tableName}.csv`); // Fetch the database

      const duckPlot = new DuckPlot(db);
      Function("duckPlot", "db", "Plot", this.codeString)(duckPlot, db, Plot);

      // Render the plot asynchronously
      const plot = await duckPlot.render();
      this.duckPlot = duckPlot;
      this.plot = plot; // Store the plot in the component's data
      // If we want to retrieve the queries instead of render the plot....
      const isQueryRequest = this.codeString.includes(".queries(");
      const isDescribeRequest = this.codeString.includes(".describe(");
      if (isQueryRequest) this.displayQueries();
      else if (isDescribeRequest) this.describeQueries();
      else this.renderPlot(); // Call the method to append the plot
    }
  },
  methods: {
    renderPlot() {
      if (this.plot && this.$refs.plotContainer) {
        this.$refs.plotContainer.appendChild(this.plot);
      }
    },
    displayQueries() {
      if (this.duckPlot && this.$refs.plotContainer) {
        this.queries = this.duckPlot.queries();
        this.showQueries = true;
      }
    },
    describeQueries() {
      if (this.duckPlot && this.$refs.plotContainer) {
        this.description = this.duckPlot.describe();
        this.showDescribe = true;
      }
    },
  },
  components: {
    CodeDisplay,
  },
};
</script>
