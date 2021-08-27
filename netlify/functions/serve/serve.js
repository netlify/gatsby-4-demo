// @ts-check
const { join } = require("path");
const os = require("os");
const { copy, existsSync } = require(`fs-extra`);
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

// function reverseFixedPagePath(pageDataRequestPath) {
//   return pageDataRequestPath === `index` ? `/` : pageDataRequestPath
// }

const render = async (pathName) => {
  const { GraphQLEngine } = require("../../../.cache/query-engine");

  const { getData, renderHTML } = require(`../../../.cache/page-ssr`);

  console.time(`start engine`);
  if (!existsSync(tmpCache)) {
    await copy(cacheDir, tmpCache);
  }

  const dbPath = join(tmpCache, "data", "datastore");

  const graphqlEngine = new GraphQLEngine({
    dbPath,
  });
  console.timeEnd(`start engine`);
  {
    //   router.get(
    //     `/page-data/:pagePath(*)/page-data.json`,
    //     async (req, res, next) => {
    //       const requestedPagePath = req.params.pagePath
    //       if (!requestedPagePath) {
    //         next()
    //         return
    //       }
    //       const pathName = reverseFixedPagePath(requestedPagePath)
    //       const page = graphqlEngine.findPageByPath(pathName)
    //       if (page && page.mode === `DSR`) {
    //         const data = await getData({
    //           pathName,
    //           graphqlEngine,
    //         })
    //         const results = await renderPageData({
    //           data,
    //         })
    //         res.send(results)
    //         return
    //       }
    //       next()
    //       return
    //     }
    //   )
  }

  console.time(`find page`);
  const page = graphqlEngine.findPageByPath(pathName);
  console.timeEnd(`find page`);
  console.log({ page });

  if (page && page.mode === `DSR`) {
    console.time(`dsr`);
    const data = await getData({
      pathName,
      graphqlEngine,
    });
    const results = await renderHTML({
      data,
    });
    console.timeEnd(`dsr`);
    return results;
  }

  return;
};

exports.handler = async function handler(event, context) {
  console.log(process.env);
  console.log(`event: ${JSON.stringify(event)}`);
  return {
    statusCode: 200,
    body: await render(event.path),
  };
};
