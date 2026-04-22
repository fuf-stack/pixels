/* eslint-disable import-x/no-extraneous-dependencies */
import { baseConfig } from '@repo/tsdown-config/config';
import { defineConfig } from 'tsdown';

/**
 * Veto package configuration.
 */
export default defineConfig({
  ...baseConfig,
  // Preserve current veto public entry surface.
  entry: ['src/index.ts'],
  // Keep existing output naming used by package.json (`module` -> .mjs, `main` -> .js).
  outExtensions({ format }) {
    return {
      dts: '.d.ts',
      js: format === 'es' || format === 'esm' ? '.mjs' : '.js',
    };
  },
  // Do not auto-generate new subpath exports for veto in this migration.
  exports: false,
  // Inline external declaration types similar to prior tsup --dts-resolve behavior.
  dts: {
    resolve: true,
  },
  // Use the build-specific tsconfig
  tsconfig: 'tsconfig.build.json',
});
