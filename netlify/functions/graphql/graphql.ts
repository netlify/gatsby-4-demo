import { join } from "path";
import { prepareFilesystem, TEMP_CACHE_DIR } from "../../../src/utils";
import { serveStatic } from "./static";
import { Handler, HandlerResponse } from "@netlify/functions";
import type { GraphQLEngine as GraphQLEngineType } from "../../../.cache/query-engine";
prepareFilesystem(["data", "query-engine"]);

const { GraphQLEngine } = require(process.cwd() + "/.cache/query-engine") as {
  GraphQLEngine: typeof GraphQLEngineType;
};

function errorResponse(message: string): HandlerResponse {
  return {
    statusCode: 400,
    body: JSON.stringify({
      errors: [{ message }],
    }),
    headers: {
      "Content-Type": "application/json",
    },
  };
}

export const handler: Handler = async function handler(event, context) {
  if (event.httpMethod === "GET") {
    return serveStatic(event);
  }
  const dbPath = join(TEMP_CACHE_DIR, "data", "datastore");

  const graphqlEngine = new GraphQLEngine({
    dbPath,
  });

  if (!event.body) {
    return errorResponse("No query provided");
  }
  let query: string;

  try {
    query = JSON.parse(event.body).query;
  } catch (e) {
    return errorResponse("Invalid query format");
  }

  if (!query) {
    return errorResponse("No query provided");
  }

  try {
    const result = await graphqlEngine.runQuery(query, {});
    return {
      statusCode: 200,
      body: JSON.stringify({ extensions: {}, ...result }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (e) {
    return errorResponse(e.message);
  }
};
