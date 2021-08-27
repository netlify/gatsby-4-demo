// @ts-check
const { join, dirname } = require(`path`);
const fs = require("fs-extra");

const lmdbCacheString = "process.cwd(), `.cache/${cacheDbFile}`";
const replacement = "require('os').tmpdir(), 'gatsby', `.cache/${cacheDbFile}`";

async function patchFile(baseDir) {
  const bundleFile = join(baseDir, ".cache", "query-engine", "index.js");
  const bundle = await fs.readFile(bundleFile, "utf8");

  //  I'm so, so sorry
  fs.writeFileSync(bundleFile, bundle.replace(lmdbCacheString, replacement));
}

exports.onBuild = async ({ constants, netlifyConfig }) => {
  await patchFile(dirname(netlifyConfig.build.publish));
};
