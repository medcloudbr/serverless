'use strict';

const path = require('path');
const disableServerlessStatsRequests = require('@serverless/test/disable-serverless-stats-requests');
const ensureArtifact = require('../lib/utils/getEnsureArtifact');
const resolveLocalServerless = require('../lib/cli/resolve-local-serverless-path');

disableServerlessStatsRequests(path.resolve(__dirname, '..'));

const BbPromise = require('bluebird');

BbPromise.config({
  longStackTraces: true,
});

const { runnerEmitter } = require('@serverless/test/setup/patch');

runnerEmitter.on('runner', (runner) => {
  runner.on('suite end', (suite) => {
    if (!suite.parent || !suite.parent.root) return;

    // Ensure to reset cache for local serverless installation resolution
    // Leaking it across test files may introduce wrong assumptions when result is used for testing
    resolveLocalServerless.clear();
    // Ensure to reset memoization on artifacts generation after each test file run.
    // Reason is that homedir is automatically cleaned for each test,
    // therefore eventually built custom resource file is also removed
    ensureArtifact.clear();
  });
});
