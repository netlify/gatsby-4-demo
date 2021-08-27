// @ts-check
const { join } = require("path");
const os = require("os");
const { existsSync, copySync, emptyDirSync } = require(`fs-extra`);
const { link } = require(`linkfs`);
const fs = require(`fs`);
const cacheDir = join(process.cwd(), `.cache`);
const tmpCache = join(os.tmpdir(), "gatsby", ".cache");
const { builder } = require("@netlify/functions");

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
emptyDirSync(tmpCache);
const includedDirs = ["data", "page-ssr", "query-engine"];

includedDirs.forEach((dir) => {
  if (!existsSync(join(tmpCache, dir))) {
    copySync(join(cacheDir, dir), join(tmpCache, dir));
  }
});
const bundleFile = join(tmpCache, "query-engine", "index.js");
const bundle = fs.readFileSync(bundleFile, "utf8");

const lmdbCacheString = "process.cwd(), `.cache/${cacheDbFile}`";
const replacement = `"${os.tmpdir()}", "gatsby", \`.cache/\${cacheDbFile}\``;
//  I'm so, so sorry
fs.writeFileSync(bundleFile, bundle.replace(lmdbCacheString, replacement));

const { GraphQLEngine } = require(tmpCache + "/query-engine");

const {
  getData,
  renderHTML,
  renderPageData,
} = require(`../../../.cache/page-ssr`);

function reverseFixedPagePath(pageDataRequestPath) {
  return pageDataRequestPath === `index` ? `/` : pageDataRequestPath;
}

const DATA_SUFFIX = "/page-data.json";
const DATA_PREFIX = "/page-data/";

const render = async (eventPath) => {
  const isPageData =
    eventPath.endsWith(DATA_SUFFIX) && eventPath.startsWith(DATA_PREFIX);

  const pathName = isPageData
    ? reverseFixedPagePath(
        eventPath.slice(DATA_PREFIX.length - 1, 1 - DATA_SUFFIX.length)
      )
    : eventPath;

  console.time(`start engine`);
  console.log({ isPageData, pathName });

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

exports.handler = builder(async function handler(event, context) {
  console.log(process.env);
  console.log(`event: ${JSON.stringify(event)}`);
  return render(event.path);
});
