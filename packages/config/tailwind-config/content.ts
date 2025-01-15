import type { ContentConfig } from 'tailwindcss/types/config';

import path from 'path';

/**
 * nextui used components
 * @see https://nextui.org/docs/guide/installation#tailwind-css-setup-1
 *
 * all nextui components that are in use for theme
 * update with: pnpm list "@nextui-org/*" --recursive | grep @nextui-org/ | sort | uniq -u
 */
const NEXTUI_THEME_USED_COMPONENT_PATHS = [
  'accordion',
  'alert',
  'autocomplete',
  'avatar',
  'badge',
  'button',
  'card',
  'chip',
  'checkbox',
  'divider',
  'drawer',
  'dropdown',
  'input',
  'modal',
  'popover',
  'progress',
  'radio',
  'select',
  'scroll-shadow',
  'table',
  'tabs',
  'toggle', // switch is toggle for some reason...
  'tooltip',
  // theme is not required
].map((c) =>
  path.resolve(
    __dirname,
    `./node_modules/@nextui-org/theme/dist/components/${c}.js`,
  ),
);

// see: https://tailwindcss.com/docs/theme
const content: ContentConfig = [
  // relative path in packages that use the config
  'src/**/*.{js,ts,jsx,tsx}',

  // workspace component package paths
  path.resolve(__dirname, '../../pixels/src/**/*.tsx'),
  path.resolve(__dirname, '../../uniform/src/**/*.tsx'),

  // nextui theme component paths
  ...NEXTUI_THEME_USED_COMPONENT_PATHS,
];

export default content;
