/* eslint-disable import-x/no-extraneous-dependencies */

import { mergeConfig } from 'vitest/config';

import config from '@fuf-stack/vitest-config/workspace';

export default mergeConfig(config, {
  test: {
    // Append Node-based CI script tests to the shared workspace projects so
    // pnpm test (and CI's unit-test selection) runs them automatically.
    projects: [
      {
        test: {
          name: 'ci-scripts',
          environment: 'node',
          include: ['scripts/ci-*.test.mjs'],
        },
      },
    ],
  },
});
