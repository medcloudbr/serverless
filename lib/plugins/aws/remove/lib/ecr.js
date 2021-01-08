'use strict';

module.exports = {
  async checkIfEcrRepositoryExists() {
    // TODO: TESTS
    const registryId = await this.provider.getAccountId();
    const repositoryName = this.provider.naming.getEcrRepositoryName();
    try {
      await this.provider.request('ECR', 'describeRepositories', {
        repositoryNames: [repositoryName],
        registryId,
      });
      return true;
    } catch (err) {
      if (err.providerError && err.providerError.code === 'RepositoryNotFoundException') {
        return false;
      }
      throw err;
    }
  },
  async removeEcrRepository() {
    // TODO: TESTS
    this.serverless.cli.log('Removing ECR repository...');
    const registryId = await this.provider.getAccountId();
    const repositoryName = this.provider.naming.getEcrRepositoryName();
    const params = {
      registryId,
      repositoryName,
      force: true, // To ensure removal of non-empty repository
    };

    await this.provider.request('ECR', 'deleteRepository', params);
  },
};
