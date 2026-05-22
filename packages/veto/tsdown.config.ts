/* eslint-disable import-x/no-extraneous-dependencies */
import { baseConfig } from '@repo/tsdown-config/config';
import { defineConfig } from 'tsdown';

/**
 * Veto package configuration.
 *
 * Bundles `zod` (both JS and .d.ts) into veto's dist so that:
 *  - consumers do not need `zod` in their own package.json
 *  - veto's emitted .d.ts is fully portable across pnpm strict-deps layouts
 *  - the veto version pins the exact zod implementation it was tested with
 *
 * See: docs/veto-monorepo-usage.md for the rationale.
 */
export default defineConfig({
  ...baseConfig,
  // Force-bundle zod (JS + .d.ts) so veto is hermetic and consumers don't
  // need zod resolvable in their own node_modules. Combined with
  // `export type * from 'zod'` in src/index.ts to keep every inlined type
  // nameable from veto's public surface.
  deps: {
    alwaysBundle: ['zod'],
  },
  // Preserve current veto public entry surface.
  entry: ['src/index.ts'],
  // Do not auto-generate new subpath exports for veto in this migration.
  exports: false,
  // Keep existing output naming used by package.json (`module` -> .mjs, `main` -> .js).
  outExtensions({ format }) {
    return {
      dts: '.d.ts',
      js: format === 'es' ? '.mjs' : '.js',
    };
  },
  // Use the build-specific tsconfig
  tsconfig: 'tsconfig.build.json',
});
