/* eslint-disable import/no-extraneous-dependencies */

import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    clearMocks: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
});
