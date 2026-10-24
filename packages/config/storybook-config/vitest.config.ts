import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import tailwindcss from '@tailwindcss/vite';
import { playwright } from '@vitest/browser-playwright';

const storybookRoot = path.dirname(fileURLToPath(import.meta.url));
const configDirectory = path.resolve(storybookRoot, '.storybook');

export default {
  root: storybookRoot,
  // Browser tests need the same utility compilation as the Storybook server.
  plugins: [tailwindcss()],
  // Do not share optimizer metadata with an open Storybook development server.
  cacheDir: path.join(storybookRoot, 'node_modules/.vite-browser-tests'),
  optimizeDeps: {
    // Discover all story dependencies before executing browser tests, including
    // renderer prototypes that introduce a new interaction foundation.
    entries: ['atelier', 'megapixels', 'pixels', 'uniform'].map((name) => {
      return path.resolve(storybookRoot, `../../${name}/src/**/*.stories.tsx`);
    }),
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
          // focus assertions share the browser, run story files without competing pages
          fileParallelism: false,
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
};
