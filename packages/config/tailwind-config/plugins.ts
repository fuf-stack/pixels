/* eslint-disable import/no-extraneous-dependencies */

import type { PluginsConfig } from 'tailwindcss/types/config';

import { heroui } from '@heroui/theme';

const plugins: Partial<PluginsConfig> = [
  // see: https://www.heroui.com//docs/guide/installation#tailwind-css-setup-1
  heroui({}),
];

export default plugins;
