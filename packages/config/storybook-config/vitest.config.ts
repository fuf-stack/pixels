import { defineConfig } from 'vitest/config';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

const storybookRoot = path.dirname(fileURLToPath(import.meta.url));
const configDirectory = path.resolve(storybookRoot, '.storybook');

export default defineConfig({
  root: storybookRoot,
  test: {
    projects: [
      {
        extends: true,
        root: storybookRoot,
        plugins: [
          storybookTest({
            configDir: configDirectory,
            tags: {
              exclude: ['test-exclude'],
              include: ['test'],
              skip: [],
            },
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            instances: [{ browser: 'chromium' }],
            provider: playwright({}),
          },
        },
      },
    ],
  },
});
