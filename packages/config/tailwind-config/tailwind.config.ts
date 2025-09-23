import type { Config } from 'tailwindcss';

import content from './content';
import plugins from './plugins';
import theme from './theme';

const config: Config = {
  // add content config (see: content.ts)
  content,
  // add plugins (see: plugins.ts)
  plugins,
  // extend theme (see: theme.ts)
  theme: { extend: theme },
};

export default config;
