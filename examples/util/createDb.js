export const createDb = (fileName, csvFile) => {
  if (typeof window !== "undefined") {
    // Client-side
    return import("./createDbClient.js").then((module) =>
      module.createDbClient(fileName, csvFile)
    );
  } else {
    // Server-side
    return import("./createDbServer.js").then((module) =>
      module.createDbServer(fileName)
    );
  }
};
