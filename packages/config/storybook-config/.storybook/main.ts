import type { StorybookConfig } from '../main';

import sharedConfig from '../main';

const config: StorybookConfig = {
  ...sharedConfig,
  stories: [
    '../../../megapixels/src/**/*.stories.@(ts|tsx)',
    '../../../pixels/src/**/*.stories.@(ts|tsx)',
    '../../../uniform/src/**/*.stories.@(ts|tsx)',
  ],
};

export default config;
