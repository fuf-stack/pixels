/* eslint-disable import-x/no-extraneous-dependencies */
import { baseConfig } from '@repo/tsdown-config/config';
import { defineConfig } from 'tsdown';

export default defineConfig({
  ...baseConfig,
  // Keep file names stable per entry (avoid hashed chunk names in published exports).
  unbundle: true,
  // Keep using the package's build-specific tsconfig.
  tsconfig: 'tsconfig.build.json',
  // Keep existing package.json exports stable.
  exports: false,
  // Emit per-entry CSS files so Json's theme stylesheet is available as dist/Json/theme.css.
  css: {
    splitting: true,
  },
});
