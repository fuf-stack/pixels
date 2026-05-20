/* eslint-disable import-x/no-extraneous-dependencies */
/* eslint-disable n/no-sync */

/**
 * Shared tsdown configuration for library packages.
 *
 * tsdown is powered by Rolldown (Rust-based bundler).
 *
 * @see https://tsdown.dev
 */

import type { UserConfig } from 'tsdown';

import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

import { defineConfig } from 'tsdown';

/**
 * Recursively collects all file paths from a directory.
 */
function getAllFilePaths(dirPath: string): string[] {
  return readdirSync(dirPath).reduce<string[]>((allFiles, file) => {
    const fullPath = path.join(dirPath, file);
    if (statSync(fullPath).isDirectory()) {
      return allFiles.concat(getAllFilePaths(fullPath));
    }
    return allFiles.concat(`./${fullPath}`);
  }, []);
}

/**
 * Entry points: all index.ts files in src directory.
 * This enables tree-shaking by exposing each module separately.
 */
const entry = getAllFilePaths('./src')
  .flat()
  .filter((file) => {
    return file.endsWith('index.ts');
  });

/**
 * Base configuration object (without defineConfig wrapper).
 * Can be spread into other configs for customization.
 */
export const baseConfig: UserConfig = {
  // Entry points for the build
  entry,

  // Output directory
  outDir: 'dist',

  // Generate both ES modules (.js) and CommonJS (.cjs)
  // Note: tsdown uses 'es' internally for ESM.
  format: ['esm', 'cjs'],

  // Customize output extensions to match expected package.json exports
  // ESM: .js, CJS: .cjs (for type: "module" packages)
  // Note: tsdown passes format as 'es' (not 'esm') internally
  outExtensions({ format }) {
    return {
      js: format === 'es' ? '.js' : '.cjs',
      dts: format === 'es' ? '.d.ts' : '.d.cts',
    };
  },

  // Generate TypeScript declaration files (.d.ts)
  dts: true,

  // Generate source maps for debugging
  sourcemap: true,

  // Clean output directory before build
  clean: true,

  // Auto-generate package.json exports field based on entry points
  // @see https://tsdown.dev/options/package-exports#auto-generating-package-exports
  exports: true,
};

/**
 * Default export: ready-to-use config with defineConfig wrapper.
 * Use this for packages that don't need customization.
 */
export default defineConfig(baseConfig);
