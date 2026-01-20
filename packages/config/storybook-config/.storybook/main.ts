import type { StorybookConfig } from '../main';

// @ts-expect-error fixes storybook error: One or more extensionless imports detected
// eslint-disable-next-line import-x/extensions
import sharedConfig from '../main.ts';

const config: StorybookConfig = {
  ...sharedConfig,
  stories: [
    '../../../megapixels/src/**/*.stories.@(ts|tsx)',
    '../../../pixels/src/**/*.stories.@(ts|tsx)',
    '../../../uniform/src/**/*.stories.@(ts|tsx)',
  ],
};

export default config;
