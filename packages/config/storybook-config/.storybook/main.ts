import type { StorybookConfig } from '../main';

// @ts-expect-error fixes storybook error: One or more extensionless imports detected
// eslint-disable-next-line import-x/extensions
import sharedConfig from '../main.ts';

const config: StorybookConfig = {
  ...sharedConfig,
  stories: [
    '../../../atelier/src/**/*.stories.tsx',
    '../../../megapixels/src/**/*.stories.tsx',
    '../../../pixels/src/**/*.stories.tsx',
    '../../../uniform/src/**/*.stories.tsx',
  ],
};

export default config;
