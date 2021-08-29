// @ts-check
const { join } = require("path");
const os = require("os");
const { existsSync, copySync, emptyDirSync } = require(`fs-extra`);
const { link } = require(`linkfs`);
const fs = require(`fs`);
const CACHE_DIR = join(process.cwd(), `.cache`);
const TEMP_CACHE_DIR = join(os.tmpdir(), "gatsby", ".cache");

function prepareFilesystem(includedDirs) {
  const rewrites = [
    [CACHE_DIR, TEMP_CACHE_DIR],
    [join(process.cwd(), "public"), join(os.tmpdir(), "gatsby", "public")],
  ];
  const lfs = link(fs, rewrites);
  for (const key in lfs) {
    if (Object.hasOwnProperty.call(fs[key], "native")) {
      lfs[key].native = fs[key].native;
    }
  }
  global._fsWrapper = lfs;
  emptyDirSync(TEMP_CACHE_DIR);

  includedDirs.forEach((dir) => {
    if (!existsSync(join(TEMP_CACHE_DIR, dir))) {
      copySync(join(CACHE_DIR, dir), join(TEMP_CACHE_DIR, dir));
    }
  });
}

module.exports = {
  prepareFilesystem,
  CACHE_DIR,
  TEMP_CACHE_DIR,
};
