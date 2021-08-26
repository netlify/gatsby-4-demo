const { join } = require("path");
const { GraphQLEngine } = require("../../../.cache/query-engine");
const {
  getData,
  renderPageData,
  renderHTML,
} = require(`../../../.cache/page-ssr`);

const { copy, existsSync } = require(`fs-extra`);
const { link } = require(`linkfs`)
const realFs = require(`fs`)

const cacheDir = join(process.env.LAMBDA_TASK_ROOT, `.cache`)
const tmpCache = join("/tmp", "gatsby",".cache")
const rewrites = [[cacheDir, tmpCache], [join(process.env.LAMBDA_TASK_ROOT, "public"), join("/tmp", "gatsby", "public")]]
global._fsWrapper = link(realFs, rewrites)

// function reverseFixedPagePath(pageDataRequestPath) {
//   return pageDataRequestPath === `index` ? `/` : pageDataRequestPath
// }

const render = async (pathName) => {
  console.log(rewrites)
  console.time(`start engine`);

  if(!existsSync(tmpCache)) {
    await copy(cacheDir, tmpCache)
  }


  const dbPath = join(tmpCache, "data", "datastore")  


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
console.log(process.env)
  console.log(`event: ${JSON.stringify(event)}`);
  return {
    statusCode: 200,
    body: await render(event.path),
  };
};
