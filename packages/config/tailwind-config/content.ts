import type { Config } from 'tailwindcss';

import path from 'node:path';

/**
 * heroui used components
 * @see https://heroui.org/docs/guide/installation#tailwind-css-setup-1
 *
 * all heroui components that are in use for theme
 * update with: pnpm list "@heroui/*" --recursive | grep @heroui/ | sort | uniq -u
 */
const HEROUI_THEME_USED_COMPONENT_PATHS = [
  'accordion',
  'alert',
  'autocomplete',
  'avatar',
  'badge',
  'breadcrumbs',
  'button',
  'card',
  'checkbox',
  'chip',
  'divider',
  'drawer',
  'dropdown',
  'input',
  'number-input',
  'modal',
  'popover',
  'progress',
  'radio',
  'scroll-shadow',
  'select',
  'table',
  'tabs',
  'toast',
  'toggle', // switch is toggle for some reason...
  'tooltip',
  // theme is not required
].map((c) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return path.resolve(
    __dirname,
    `./node_modules/@heroui/theme/dist/components/${c}.js`,
  );
});

// see: https://tailwindcss.com/docs/theme
const content: Config['content'] = [
  // relative path in packages that use the config
  'src/**/*.{js,ts,jsx,tsx}',

  // workspace component package paths
  path.resolve(__dirname, '../../megapixels/src/**/*.tsx'),
  path.resolve(__dirname, '../../pixels/src/**/*.tsx'),
  path.resolve(__dirname, '../../uniform/src/**/*.tsx'),

  // heroui theme component paths
  ...HEROUI_THEME_USED_COMPONENT_PATHS,
];

export default content;
