'use strict';

module.exports = async function () {
  // TODO: TESTS
  // TODO: ADD LOGGING
  // TODO: CHECK IF THERE ARE ANY IMAGES IN SERVERLESS.YML?
  const registryId = await this.provider.getAccountId();
  const repositoryName = this.provider.getEcrRepositoryName();
  const params = {
    registryId,
    repositoryName,
    force: true, // To force removal of non-empty repository
  };

  try {
    await this.provider.request('ECR', 'deleteRepository', params);
  } catch (err) {
    if (err.providerError && err.providerError.code === 'RepositoryNotFoundException') {
      // Pass silently
    } else {
      throw err;
    }
  }
};
