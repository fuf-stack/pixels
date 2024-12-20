import type { StorybookConfig } from '@storybook/react-vite';

import path from 'path';

const config: StorybookConfig = {
  // this has to be defined where shared config is used
  stories: [],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
    '@storybook/addon-links',
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
    'storybook-dark-mode',
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
  // enable autodocs for all stories
  // see: https://storybook.js.org/docs/react/writing-docs/autodocs
  docs: {
    autodocs: true,
  },
  // TEMP FIX: Attempted to resolveName for an unsupported path. resolveName does not accept ObjectMethod
  // see: https://storybook.js.org/docs/api/main-config-typescript#reactdocgen
  // see: https://github.com/storybookjs/storybook/issues/26652
  // see: https://github.com/reactjs/react-docgen/issues/902
  typescript: {
    reactDocgen: false,
  },
};

export default config;

export type { StorybookConfig };
