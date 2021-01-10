'use strict';

const _ = require('lodash');

module.exports = {
  async cleanupEcrRepository() {
    // TODO: Add check if we should even try removing anything
    const repositoryName = this.provider.naming.getEcrRepositoryName();
    const registryId = await this.provider.getAccountId();

    const describeImagesParams = {
      repositoryName,
      registryId,
    };

    const imageDigests = [];
    let describeImagesResponse = await this.provider.request(
      'ECR',
      'describeImages',
      describeImagesParams
    );
    imageDigests.push(...describeImagesResponse.imageDigests);

    while (describeImagesResponse.nextToken) {
      describeImagesResponse = await this.provider.request('ECR', 'describeImages', {
        ...describeImagesParams,
        nextToken: describeImagesResponse.nextToken,
      });
      imageDigests.push(...describeImagesResponse.imageDigests);
    }

    // We should only keep the images that are tagged with imageNames that are defined in service
    const imageTagsDefinedInService = Object.keys(
      _.get(this.serverless.service.provider, 'docker.images', {})
    );
    const imageDigestsToRemove = describeImagesResponse.imageDetails
      .filter(
        (image) =>
          !image.imageTags ||
          !image.imageTags.some((tag) => imageTagsDefinedInService.includes(tag))
      )
      .map(({ imageDigest }) => ({ imageDigest }));

    if (imageDigestsToRemove.length) {
      this.serverless.cli.log('Removing old Docker images from ECR...');
      const batchDeleteImageParams = {
        repositoryName,
        registryId,
        imageIds: imageDigestsToRemove,
      };

      await this.provider.request('ECR', 'batchDeleteImage', batchDeleteImageParams);
    }
  },
};
