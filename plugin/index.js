// @ts-check
const { join, dirname } = require(`path`);
const fs = require("fs-extra");
const { spliceConfig } = require("./utils");

const lmdbCacheString = "process.cwd(), `.cache/${cacheDbFile}`";
const replacement = "require('os').tmpdir(), 'gatsby', `.cache/${cacheDbFile}`";

async function patchFile(baseDir) {
  const bundleFile = join(baseDir, ".cache", "query-engine", "index.js");
  const bundle = await fs.readFile(bundleFile, "utf8");

  //  I'm so, so sorry
  fs.writeFileSync(bundleFile, bundle.replace(lmdbCacheString, replacement));
}
function fixedPagePath(pagePath) {
  return pagePath === `/` ? `index` : pagePath;
}

exports.onBuild = async ({ constants, netlifyConfig }) => {
  const root = dirname(netlifyConfig.build.publish);
  await patchFile(root);
  const functions = await fs.readJson(
    join(root, ".cache", "functions", "manifest.json")
  );

  const redirects = [];
  for (const func of functions) {
    if (!func.functionRoute.startsWith("_ssr")) {
      continue;
    }
    let route = func.matchPath || func.functionRoute;
    route = route.replace("_ssr/", "/");
    if (route.startsWith("/page-data")) {
      route = [...fixedPagePath(route).split("/"), "page-data.json"]
        .filter(Boolean)
        .join("/");
    }
    redirects.push(`${route} /.netlify/functions/ssr 200`);
  }
  spliceConfig({
    startMarker: "# Gatsby SSR routes start",
    endMarker: "# Gatsby SSR routes end",
    contents: redirects.join("\n"),
    fileName: join(netlifyConfig.build.publish, "_redirects"),
  });
  console.log(redirects);
};
