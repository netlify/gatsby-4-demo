// @ts-check
const { join } = require("path");
const { builder } = require("@netlify/functions");
const {
  prepareFilesystem,
  TEMP_CACHE_DIR,
  getPagePathFromPageDataPath,
} = require("../../../src/utils");
const { GraphQLEngine } = require("../../../.cache/query-engine");
const {
  getData,
  renderHTML,
  renderPageData,
} = require(`../../../.cache/page-ssr`);

// So that it's bundled with the build
require("@babel/runtime/helpers/interopRequireDefault");

prepareFilesystem(["data", "page-ssr", "query-engine"]);

const DATA_SUFFIX = "/page-data.json";
const DATA_PREFIX = "/page-data/";

const render = async (eventPath) => {
  const isPageData =
    eventPath.endsWith(DATA_SUFFIX) && eventPath.startsWith(DATA_PREFIX);

  const pathName = isPageData
    ? getPagePathFromPageDataPath(eventPath)
    : eventPath;

  const dbPath = join(TEMP_CACHE_DIR, "data", "datastore");

  const graphqlEngine = new GraphQLEngine({
    dbPath,
  });
  const page = graphqlEngine.findPageByPath(pathName);

  if (page && page.mode === `DSR`) {
    const data = await getData({
      pathName,
      graphqlEngine,
    });

    if (isPageData) {
      return {
        statusCode: 200,
        body: JSON.stringify(await renderPageData({ data })),
        headers: {
          "Content-Type": "application/json",
        },
      };
    }

    return {
      statusCode: 200,
      body: await renderHTML({ data }),
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    };
  }

  return {
    statusCode: 404,
    body: `Page not found`,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  };
};

exports.handler = builder(async function handler(event, context) {
  return render(event.path);
});
