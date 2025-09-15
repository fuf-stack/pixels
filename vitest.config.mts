/* eslint-disable import-x/no-extraneous-dependencies */

import { defineConfig, mergeConfig } from 'vitest/config';

import config from '@fuf-stack/vitest-config';

export default mergeConfig(
  config,
  defineConfig({
    test: {
      // isolate: false
    },
  }),
);
