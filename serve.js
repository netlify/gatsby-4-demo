const { join } = require("path")
const { GraphQLEngine } = require("./.cache/query-engine")
const { getData, renderPageData, renderHTML } = require(`./.cache/page-ssr`)

// function reverseFixedPagePath(pageDataRequestPath) {
//   return pageDataRequestPath === `index` ? `/` : pageDataRequestPath
// }

const render = async pathName => {
  console.time("requiregql")
  console.timeEnd("requiregql")

  console.time("requiressr")

  console.timeEnd("requiressr")

  console.time(`start engine`)
  const graphqlEngine = new GraphQLEngine({
    dbPath: join(`.`, `.cache`, `data`, `datastore`),
  })
  console.timeEnd(`start engine`)
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

  console.time(`find page`)
  const page = graphqlEngine.findPageByPath(pathName)
  console.timeEnd(`find page`)

  if (page && page.mode === `DSR`) {
    console.time(`dsr`)
    const data = await getData({
      pathName,
      graphqlEngine,
    })
    const results = await renderHTML({
      data,
    })
    console.timeEnd(`dsr`)
  }

  return
}

async function go() {
  const start = Date.now()
  await render(`/posts/my-second-post`)
  console.log(`time: ${Date.now() - start}`)
}

go()
