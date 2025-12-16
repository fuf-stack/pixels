/* eslint-disable import-x/no-extraneous-dependencies */
import { baseConfig } from '@repo/tsdown-config/config';
import { defineConfig } from 'tsdown';

/**
 * Veto package configuration.
 * Uses build-specific tsconfig to exclude test files.
 *
 * Note: We don't use dts.resolve here because bundling zod types
 * causes issues for consumers generating their own declarations.
 * Instead, zod stays as a dependency and types reference it directly.
 */
export default defineConfig({
  ...baseConfig,
  // Use the build-specific tsconfig
  tsconfig: 'tsconfig.build.json',
});
