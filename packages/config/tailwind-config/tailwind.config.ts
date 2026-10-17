import type { Config } from 'tailwindcss';

import content from './content';
import theme from './theme';

const config: Config = {
  // add content config (see: content.ts)
  content,
  // extend theme (see: theme.ts)
  theme: { extend: theme },
};

export default config;
