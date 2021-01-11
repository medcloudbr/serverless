'use strict';

const Ajv = require('ajv').default;
const objectHash = require('object-hash');
const path = require('path');
const os = require('os');
const standaloneCode = require('ajv/dist/standalone').default;
const fs = require('fs');
const requireFromString = require('require-from-string');
const fse = require('fs-extra');
const memoizee = require('memoizee');
const deepSortObjectByKey = require('../../utils/deepSortObjectByKey');

// TODO: Remove - for comparison only
// const basicgenerate = (schema) => {
//   const ajv = new Ajv({
//     allErrors: true,
//     coerceTypes: 'array',
//     verbose: true,
//     strict: false,
//     code: { source: true },
//   });
//   require('ajv-keywords')(ajv, 'regexp');
//   require('ajv-formats').default(ajv);
//   const validate = ajv.compile(schema);
//   return validate;
// };

// TODO: Refactor
const ensureExists = memoizee(
  (cacheDir, fileName, generate) => {
    return fse
      .lstat(path.resolve(cacheDir, fileName))
      .then(
        (stats) => {
          if (stats.isFile()) return true;
          return false;
        },
        (error) => {
          if (error.code === 'ENOENT') return false;
          throw error;
        }
      )
      .then((isGenerated) => {
        if (!isGenerated) {
          return fse.ensureDir(cacheDir).then(() => generate(path.resolve(cacheDir, fileName)));
        }
        return null;
      })
      .then(() => path.resolve(cacheDir, fileName));
  },
  { promise: true }
);

const getValidate = async (schema) => {
  const schemaHash = objectHash(deepSortObjectByKey(schema));

  const generate = (cachePath) => {
    const ajv = new Ajv({
      allErrors: true,
      coerceTypes: 'array',
      verbose: true,
      strict: false,
      code: { source: true },
    });
    require('ajv-keywords')(ajv, 'regexp');
    require('ajv-formats').default(ajv);
    const validate = ajv.compile(schema);
    const moduleCode = standaloneCode(ajv, validate);
    fs.writeFileSync(cachePath, moduleCode);
  };
  const cacheDir = path.resolve(os.homedir(), '.serverless/schemas');
  // TODO: Refactor
  await ensureExists(cacheDir, schemaHash, generate);
  const loadedModuleCode = fs.readFileSync(path.resolve(cacheDir, schemaHash), 'utf-8');
  return requireFromString(loadedModuleCode, path.resolve(__dirname, 'resolveAjvValidate.js'));
};

module.exports = getValidate;
