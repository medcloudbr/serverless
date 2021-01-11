'use strict';

const chai = require('chai');
const sinon = require('sinon');

const ensureExists = require('../../../../lib/utils/ensureExists');
const { getTmpDirPath } = require('../../../utils/fs');

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const expect = chai.expect;
chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));

describe('#ensureExists', () => {
  const testCacheDir = getTmpDirPath();

  it('Should call generate if file missing', async () => {
    const testFileName = `test-${crypto.randomBytes(2).toString('hex')}`;
    const generateStub = sinon.stub().resolves();
    const returnedDir = await ensureExists(testCacheDir, testFileName, generateStub);
    expect(generateStub.calledOnce).to.be.true;
    expect(returnedDir).to.equal(testCacheDir);
  });

  it('Should not call generate if file exists', async () => {
    const testFileName = `test-${crypto.randomBytes(2).toString('hex')}`;
    await fs.promises.writeFile(path.resolve(testCacheDir, testFileName), '');
    const generateStub = sinon.stub().resolves();
    const returnedDir = await ensureExists(testCacheDir, testFileName, generateStub);
    expect(generateStub.calledOnce).to.be.false;
    expect(returnedDir).to.equal(testCacheDir);
  });
});
