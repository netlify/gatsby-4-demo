const { join } = require("path");
const { GraphQLEngine } = require("../../../.cache/query-engine");
const {
  getData,
  renderPageData,
  renderHTML,
} = require(`../../../.cache/page-ssr`);


const realFs = require(`fs`)

global._fsWrapper = {...realFs, writeFile: async (file, data, encoding, callback) => {
console.log(`writeFile: ${file}`);
return realFs.writeFile(file, data, encoding, callback);
}};

// function reverseFixedPagePath(pageDataRequestPath) {
//   return pageDataRequestPath === `index` ? `/` : pageDataRequestPath
// }

const render = async (pathName) => {
  console.time(`start engine`);
  const dbPath = join(process.env.LAMBDA_TASK_ROOT, `.cache`, `data`, `datastore`)
  console.log({dbPath})
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
