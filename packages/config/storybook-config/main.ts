import type { StorybookConfig } from '@storybook/react-vite';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Get __dirname equivalent in ES modules
// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  // this has to be defined where shared config is used
  stories: [],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-links',
    // '@storybook/addon-vitest',
    {
      name: '@storybook/addon-coverage',
      options: {
        istanbul: {
          // coverage paths should be from project root
          cwd: path.resolve(__dirname, '../../'),
          // exclude files from coverage report
          exclude: ['**/__generated__/*', '**/*.cy.*', '**/*.stories.*'],
        },
      },
    },
    // see: https://www.npmjs.com/package/@vueless/storybook-dark-mode
    '@vueless/storybook-dark-mode',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  core: {
    // disable telemetry
    // see: https://storybook.js.org/docs/react/configure/telemetry#how-to-opt-out
    disableTelemetry: true,
  },
  // TEMP FIX: Attempted to resolveName for an unsupported path. resolveName does not accept ObjectMethod
  // see: https://storybook.js.org/docs/api/main-config-typescript#reactdocgen
  // see: https://github.com/storybookjs/storybook/issues/26652
  // see: https://github.com/reactjs/react-docgen/issues/902
  typescript: {
    reactDocgen: false,
    // reactDocgen: 'react-docgen-typescript',
  },
  async viteFinal(viteConfig) {
    // Fix for fast-deep-equal CommonJS module not being resolved properly
    // The @vueless/storybook-dark-mode addon requires this dependency
    // see: https://github.com/vuelessjs/storybook-dark-mode/issues/20
    return {
      ...viteConfig,
      optimizeDeps: {
        ...viteConfig.optimizeDeps,
        include: [
          ...(viteConfig.optimizeDeps?.include ?? []),
          'fast-deep-equal',
        ],
      },
    };
  },
};

export default config;

export type { StorybookConfig };
