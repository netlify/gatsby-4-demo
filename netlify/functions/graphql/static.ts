import { HandlerEvent, HandlerResponse } from "@netlify/functions";
import fs from "fs";
import etag from "etag";

const sendResponse = (fileName: string, mimeType: string): HandlerResponse => {
  const body = fs.readFileSync(
    require.resolve(`gatsby-graphiql-explorer/${fileName}`),
    "utf-8"
  );
  return {
    statusCode: 200,
    headers: {
      "Content-Type": mimeType,
      "Access-Control-Allow-Origin": "*",
      ETag: etag(body),
    },
    body,
  };
};
export function serveStatic(event: HandlerEvent): HandlerResponse {
  if (event.path === "/___graphql" || event.path === "/___graphiql") {
    return sendResponse("index.html", "text/html");
  } else if (event.path.endsWith("/app.js")) {
    return sendResponse("app.js", "text/javascript");
  } else if (event.path.endsWith("/fragments")) {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([]),
    };
  }
  return {
    statusCode: 404,
    body: "Not found",
  };
}
