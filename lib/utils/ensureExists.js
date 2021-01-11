'use strict';

const fse = require('fs-extra');
const fs = require('fs');
const path = require('path');

module.exports = async (cacheDir, fileName, generate) => {
  let isGenerated = false;
  try {
    const stats = await fs.promises.lstat(path.resolve(cacheDir, fileName));
    if (stats.isFile) {
      isGenerated = true;
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }

  if (isGenerated) {
    return cacheDir;
  }

  await fse.ensureDir(cacheDir);
  await generate(cacheDir);
  return cacheDir;
};
