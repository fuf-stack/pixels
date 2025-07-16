import type { StorybookConfig } from '@storybook/react-vite';

import path from 'path';

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
};

export default config;

export type { StorybookConfig };
