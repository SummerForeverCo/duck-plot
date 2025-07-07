export const createDb = (fileName) => {
  if (typeof window !== "undefined") {
    // Client-side
    return import("./createDbClient.js").then((module) =>
      module.createDbClient(fileName, "testCatalog")
    );
  } else {
    // Server-side
    return import("./createDbServer.js").then((module) =>
      module.createDbServer(fileName)
    );
  }
};
