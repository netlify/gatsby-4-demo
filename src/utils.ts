import { join } from "path";
import os from "os";
import { existsSync, copySync, emptyDirSync } from "fs-extra";
import { link } from "linkfs";
import fs from "fs";
import type { GraphQLEngine } from "../.cache/query-engine";

export const CACHE_DIR = join(process.cwd(), `.cache`);
export const TEMP_CACHE_DIR = join(os.tmpdir(), "gatsby", ".cache");

export function prepareFilesystem(includedDirs: Array<string>) {
  const rewrites = [
    [join(CACHE_DIR, "caches"), join(TEMP_CACHE_DIR, "caches")],
    [join(CACHE_DIR, "caches-lmdb"), join(TEMP_CACHE_DIR, "caches-lmdb")],
    [join(CACHE_DIR, "data"), join(TEMP_CACHE_DIR, "data")],
    [join(process.cwd(), "public"), join(os.tmpdir(), "gatsby", "public")],
  ];
  console.log(rewrites);
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
      console.time(`Copying ${dir}`);
      copySync(join(CACHE_DIR, dir), join(TEMP_CACHE_DIR, dir));
      console.timeEnd(`Copying ${dir}`);
    }
  });
}

// Inlined from gatsby-core-utils

export function reverseFixedPagePath(pageDataRequestPath: string): string {
  return pageDataRequestPath === `index` ? `/` : pageDataRequestPath;
}

export function getPagePathFromPageDataPath(
  pageDataPath: string
): string | null {
  const matches = pageDataPath.matchAll(
    /^\/?page-data\/(.+)\/page-data.json$/gm
  );

  for (const [, requestedPagePath] of matches) {
    return reverseFixedPagePath(requestedPagePath);
  }

  return null;
}

export function getGraphQLEngine() {
  const { GraphQLEngine: GQE } = require(join(CACHE_DIR, "query-engine")) as {
    GraphQLEngine: typeof GraphQLEngine;
  };

  const dbPath = join(TEMP_CACHE_DIR, "data", "datastore");

  return new GQE({
    dbPath,
  });
}
