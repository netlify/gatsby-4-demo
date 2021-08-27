// @ts-check
const { join } = require("path");
const os = require("os");
const { existsSync, copySync } = require(`fs-extra`);
const { link } = require(`linkfs`);
const fs = require(`fs`);

const cacheDir = join(process.cwd(), `.cache`);
const tmpCache = join(os.tmpdir(), "gatsby", ".cache");
const rewrites = [
  [cacheDir, tmpCache],
  [join(process.cwd(), "public"), join(os.tmpdir(), "gatsby", "public")],
];
const lfs = link(fs, rewrites);
for (const key in lfs) {
  if (Object.hasOwnProperty.call(fs[key], "native")) {
    lfs[key].native = fs[key].native;
  }
}

global._fsWrapper = lfs;

const includedDirs = ["data", "page-ssr", "query-engine"];
function reverseFixedPagePath(pageDataRequestPath) {
  return pageDataRequestPath === `index` ? `/` : pageDataRequestPath;
}

const DATA_SUFFIX = "/page-data.json";
const DATA_PREFIX = "/page-data/";

const render = async (eventPath) => {
  const { GraphQLEngine } = require("../../../.cache/query-engine");

  const {
    getData,
    renderHTML,
    renderPageData,
  } = require(`../../../.cache/page-ssr`);

  const isPageData =
    eventPath.endsWith(DATA_SUFFIX) && eventPath.startsWith(DATA_PREFIX);

  const pathName = isPageData
    ? reverseFixedPagePath(
        eventPath.slice(DATA_PREFIX.length - 1, 1 - DATA_SUFFIX.length)
      )
    : eventPath;

  console.time(`start engine`);
  console.log({ isPageData, pathName });
  includedDirs.forEach((dir) => {
    if (!existsSync(join(tmpCache, dir))) {
      copySync(join(cacheDir, dir), join(tmpCache, dir));
    }
  });

  const dbPath = join(tmpCache, "data", "datastore");

  const graphqlEngine = new GraphQLEngine({
    dbPath,
  });
  console.timeEnd(`start engine`);

  console.time(`find page`);
  const page = graphqlEngine.findPageByPath(pathName);
  console.timeEnd(`find page`);
  console.log({ page });

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

exports.handler = async function handler(event, context) {
  console.log(process.env);
  console.log(`event: ${JSON.stringify(event)}`);
  return render(event.path);
};
