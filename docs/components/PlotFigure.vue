<script>
import { h } from "vue";
import * as duckdb from "@duckdb/duckdb-wasm";
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
  console.log("connected");

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
    };
  },
  async mounted() {
    console.log(this.codeString);
    const db = await createDbClient("taxi.csv"); // Fetch the database

    const duckPlot = new DuckPlot(db);
    Function("duckPlot", "db", this.codeString)(duckPlot, db);

    // Render the plot asynchronously
    const plot = await duckPlot.render();
    this.plot = plot; // Store the plot in the component's data
    this.renderPlot(); // Call the method to append the plot
  },
  methods: {
    renderPlot() {
      if (this.plot && this.$el) {
        this.$el.append(this.plot); // Append the rendered plot to the component's element
      }
    },
  },
  render() {
    // The render function remains simple, creating a container for the plot
    return h("div");
  },
};
</script>
