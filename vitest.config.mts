/* eslint-disable import-x/no-extraneous-dependencies */

import { mergeConfig } from 'vitest/config';

import local from '@fuf-stack/vitest-config/workspace';
import github from '@fuf-stack/vitest-config/workspace/github';

const base = process.env.GITHUB_ACTIONS === 'true' ? github : local;

export default mergeConfig(base, {
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
