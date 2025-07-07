export const createDb = (fileName, catalog) => {
  if (typeof window !== "undefined") {
    // Client-side
    return import("./createDbClient.js").then((module) =>
      module.createDbClient(fileName, catalog)
    );
  } else {
    // Server-side
    return import("./createDbServer.js").then((module) =>
      module.createDbServer(fileName, catalog)
    );
  }
};
