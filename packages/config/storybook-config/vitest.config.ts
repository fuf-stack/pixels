import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharedConfig from '@repo/vite-config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

const storybookRoot = path.dirname(fileURLToPath(import.meta.url));
const configDirectory = path.resolve(storybookRoot, '.storybook');
const cacheDir = path.join(
  storybookRoot,
  'node_modules/.vite-browser-tests',
  process.env.STORYBOOK_TEST_SHARD ?? 'serial',
);

export default {
  plugins: sharedConfig.plugins,
  root: storybookRoot,
  // Do not share optimizer metadata with an open Storybook development server.
  cacheDir,
  optimizeDeps: {
    // The theme plugin keeps Pixels packages out of the optimizer. Scan their
    // compiled modules as well as the stories so their dependencies are ready.
    entries: [
      '../../{atelier,megapixels,pixel-utils,pixels,uniform}/dist/**/*.mjs',
      '../../{atelier,megapixels,pixels,uniform}/src/**/*.stories.tsx',
    ],
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
          {
            // Storybook sets its own cache, override it after the addon config hook
            name: 'isolated-storybook-test-cache',
            enforce: 'post' as const,
            config: () => {
              return { cacheDir };
            },
          },
        ],
        test: {
          name: 'storybook',
          // keep focus assertions serial within each browser, CI shards use separate runners
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
