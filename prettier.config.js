/* eslint-disable import/no-extraneous-dependencies */

const prettierConfig = require('@fuf-stack/eslint-config-fuf/prettier');

/** @type {import('prettier').Config} */
module.exports = prettierConfig({
  // tailwindConfig: 'packages/eslint-config-fuf/test/tailwind.config.js',
  workspacePackagePrefix: '@fuf-stack',
});
