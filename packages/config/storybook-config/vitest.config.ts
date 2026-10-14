import { defineConfig } from 'vitest/config';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

const storybookRoot = path.dirname(fileURLToPath(import.meta.url));
const configDirectory = path.resolve(storybookRoot, '.storybook');

export default defineConfig({
  root: storybookRoot,
  // Do not share optimizer metadata with an open Storybook development server.
  cacheDir: path.join(storybookRoot, 'node_modules/.vite-browser-tests'),
  optimizeDeps: {
    // HeroUI's transitional theme loads this CJS dependency after the entry scan.
    include: ['color2k'],
    // Discover all story dependencies before executing browser tests, including
    // renderer prototypes that introduce a new interaction foundation.
    entries: ['atelier', 'megapixels', 'pixels', 'uniform'].map((name) =>
      path.resolve(storybookRoot, `../../${name}/src/**/*.stories.tsx`),
    ),
  },
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
