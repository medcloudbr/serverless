'use strict';

const memoizee = require('memoizee');
const { version } = require('../../package');
const ensureExists = require('./ensureExists');
const path = require('path');
const os = require('os');

const cachePath = path.resolve(os.homedir(), '.serverless/artifacts', version);

module.exports = memoizee(
  (fileName, generate) => async () => {
    return await ensureExists(cachePath, fileName, generate);
  },
  { length: 1 }
);
