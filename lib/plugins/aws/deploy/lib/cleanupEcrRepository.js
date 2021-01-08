'use strict';

module.exports = async function () {
  // TODO: Add check if we should even try removing anything
  const repositoryName = this.provider.naming.getEcrRepositoryName();
  const registryId = await this.provider.getAccountId();

  const describeImagesParams = {
    repositoryName,
    registryId,
  };
  // TODO: implement support for nextToken
  const describeImagesResponse = await this.provider.request(
    'ECR',
    'describeImages',
    describeImagesParams
  );

  // We should only keep the images that are tagged with imageNames that are defined in service
  // TODO: FIRST CHECK IF THERE ARE ANY
  const imageTagsDefinedInService = Object.keys(this.serverless.service.provider.docker.images);
  const imageDigestsToRemove = describeImagesResponse.imageDetails
    .filter(
      (image) =>
        !image.imageTags || !image.imageTags.some((tag) => imageTagsDefinedInService.includes(tag))
    )
    .map(({ imageDigest }) => ({ imageDigest }));

  // TODO: ADD LOGGING
  if (imageDigestsToRemove.length) {
    const batchDeleteImageParams = {
      repositoryName,
      registryId,
      imageIds: imageDigestsToRemove,
    };

    await this.provider.request('ECR', 'batchDeleteImage', batchDeleteImageParams);
  }
};
