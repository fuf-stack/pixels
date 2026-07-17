import type { Config } from 'tailwindcss';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

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
  'calendar',
  'card',
  'checkbox',
  'chip',
  'date-input',
  'date-picker',
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
  'slider',
  'table',
  'tabs',
  'toast',
  'toggle', // switch is toggle for some reason...
  'tooltip',
  // theme is not required
].map((c) => {
  return path.resolve(
    currentDirectory,
    `./node_modules/@heroui/theme/dist/components/${c}.js`,
  );
});

// see: https://tailwindcss.com/docs/theme
const content: Config['content'] = [
  // relative path in packages that use the config
  'src/**/*.{js,ts,jsx,tsx}',

  // workspace component package paths
  path.resolve(currentDirectory, '../../megapixels/src/**/*.tsx'),
  path.resolve(currentDirectory, '../../pixels/src/**/*.tsx'),
  path.resolve(currentDirectory, '../../uniform/src/**/*.tsx'),

  // heroui theme component paths
  ...HEROUI_THEME_USED_COMPONENT_PATHS,
];

export default content;
