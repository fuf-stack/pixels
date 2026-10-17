import type { Config } from 'tailwindcss';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

// see: https://tailwindcss.com/docs/theme
const content: Config['content'] = [
  // relative path in packages that use the config
  'src/**/*.{js,ts,jsx,tsx}',

  // workspace component package paths
  path.resolve(currentDirectory, '../../megapixels/src/**/*.{ts,tsx}'),
  path.resolve(currentDirectory, '../../pixels/src/**/*.{ts,tsx}'),
  path.resolve(currentDirectory, '../../uniform/src/**/*.{ts,tsx}'),
];

export default content;
