/* eslint-disable import-x/no-extraneous-dependencies */
import { baseConfig } from '@repo/tsdown-config/config';
import { defineConfig } from 'tsdown';

export default defineConfig({
  ...baseConfig,
  // Keep file names stable per entry (avoid hashed chunk names in published exports).
  unbundle: true,
  // Keep using the build tsconfig used by tsup before migration.
  tsconfig: 'tsconfig.build.json',
  // TODO: maybe we should change that in a future breaking release
  // Keep existing package.json exports stable.
  exports: false,
  // Emit per-entry CSS files so Json's theme stylesheet is available as dist/Json/index.css.
  css: {
    splitting: true,
  },
});
