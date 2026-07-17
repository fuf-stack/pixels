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
import { join } from 'node:path';

/**
 * Recursively collects all file paths from a directory.
 */
function getAllFilePaths(dirPath: string): string[] {
  return readdirSync(dirPath).reduce<string[]>((allFiles, file) => {
    const fullPath = join(dirPath, file);
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
export const libraryBaseConfig: UserConfig = {
  // Entry points for the build
  entry,

  // Output directory
  outDir: 'dist',

  // Generate ES modules only.
  format: ['esm'],

  // Generate declaration files with the TypeScript resolver.
  // This avoids rolldown-dts fake-js warnings when dependencies ship .d.cts files.
  dts: {
    // see: https://github.com/sxzz/rolldown-plugin-dts#resolver
    resolver: 'tsc',
  },

  // Generate source maps for debugging
  sourcemap: true,

  // Clean output directory before build
  clean: true,

  // Auto-generate package.json exports field based on entry points
  // @see https://tsdown.dev/options/package-exports#auto-generating-package-exports
  exports: true,

  // Allow mixed default + named exports in entry modules without warning.
  // This matches our current package API surfaces that intentionally expose both.
  outputOptions: {
    exports: 'named',
  },
};

type BundleMatcher = RegExp | string;

interface DepBundledConfigOptions extends UserConfig {
  /**
   * Allowlist of dependencies that may be inlined into generated `.d.ts`.
   *
   * Prefer regexes that match both bare ids and subpaths
   * (example: `/^zod($|\\/)/`).
   */
  bundledDeps: BundleMatcher[];
  /**
   * Optional overrides for pass 1 (runtime JS pass).
   * `dts` is always forced to `false` for this pass.
   */
  firstPassConfig?: UserConfig;
  /**
   * Optional overrides for pass 2 (declaration pass).
   * Safe defaults are applied when omitted.
   */
  dtsPassConfig?: UserConfig;
}

/**
 * Build helper for packages that need portable declaration output.
 *
 * Shared options are passed directly to this helper (for example `tsconfig`,
 * `entry`, `exports`, or `outExtensions`). They are merged onto
 * `libraryBaseConfig` automatically.
 *
 * Produces two tsdown configs:
 * 1. Runtime pass: emits JS artifacts (ESM), with `dts: false`.
 * 2. DTS pass: emits declaration files only, bundling only allowlisted deps.
 *
 * Defaults in pass 2:
 * - `clean: false` to preserve runtime artifacts from pass 1
 * - `dts: { emitDtsOnly: true, resolver: 'tsc' }`
 * - `format: ['esm']` (single module output)
 * - `deps.alwaysBundle` / `deps.onlyBundle` derived from `bundledDeps`
 */
export function createDepBundledDtsConfig({
  bundledDeps,
  firstPassConfig,
  dtsPassConfig,
  ...sharedOverrides
}: DepBundledConfigOptions): UserConfig[] {
  const dtsPassDeps = dtsPassConfig?.deps;
  const sharedConfig: UserConfig = {
    ...libraryBaseConfig,
    ...sharedOverrides,
  };

  return [
    // Pass 1: runtime bundles only (no declaration output here).
    {
      ...sharedConfig,
      ...firstPassConfig,
      dts: false,
    },
    // Pass 2: declaration-only output with explicit bundling guardrails.
    {
      ...sharedConfig,
      ...dtsPassConfig,
      // Keep runtime output from pass 1.
      clean: dtsPassConfig?.clean ?? false,
      deps: {
        ...dtsPassDeps,
        // Dependencies to inline into `.d.ts`.
        alwaysBundle: dtsPassDeps?.alwaysBundle ?? bundledDeps,
        // Hard guard: fail if non-allowlisted deps are pulled into `.d.ts`.
        onlyBundle: dtsPassDeps?.onlyBundle ?? bundledDeps,
      },
      // Emit declaration files only in pass 2 by default.
      dts: dtsPassConfig?.dts ?? { emitDtsOnly: true, resolver: 'tsc' },
      // Single d.ts graph for ESM-only output.
      format: dtsPassConfig?.format ?? ['esm'],
    },
  ];
}
