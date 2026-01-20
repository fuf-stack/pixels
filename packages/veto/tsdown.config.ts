// TODO: this is not used for now, but we should use it in the future

/* eslint-disable import-x/no-extraneous-dependencies */
import { baseConfig } from '@repo/tsdown-config/config';
import { defineConfig } from 'tsdown';

/**
 * Veto package configuration.
 *
 * Uses dts.resolve to bundle zod/zodex types into veto's declarations.
 * This way consumers don't need zod as a dependency for types.
 *
 * The build script (scripts/build.ts) temporarily moves zod/zodex to
 * devDependencies so they get bundled by the dts resolver.
 */
export default defineConfig({
  ...baseConfig,
  // Bundle external types (zod/zodex) into veto's declarations
  dts: {
    resolve: true,
  },
  // Use the build-specific tsconfig
  tsconfig: 'tsconfig.build.json',
});
