/* eslint-disable import-x/no-extraneous-dependencies */

import type { Config } from 'tailwindcss';

import { heroui } from '@heroui/theme';

const plugins: Config['plugins'] = [
  // see: https://www.heroui.com//docs/guide/installation#tailwind-css-setup-1
  heroui(),
];

export default plugins;
