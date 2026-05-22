/* eslint-disable import-x/no-extraneous-dependencies */
import type { UserConfig } from 'tsdown';

import { baseConfig } from '@repo/tsdown-config/config';
import { defineConfig } from 'tsdown';

/**
 * Veto package configuration.
 *
 * Two-pass build so that veto can keep a *single* zod runtime instance while
 * still emitting a portable `.d.ts`:
 *
 * 1. JS pass: emit ESM + CJS bundles with `import { z } from 'zod'` left
 *    external. This guarantees one zod copy per process, which is required
 *    for the global error map (see `src/errorMap.ts`), zod's locale fallback,
 *    its metadata registries, and `instanceof ZodType` checks.
 * 2. DTS pass: emit a single `dist/index.d.ts` with zod's types inlined via
 *    `deps.alwaysBundle: ['zod']`. This makes consumers' tsc emit name every
 *    veto-returned type without referencing `node_modules/.pnpm/zod@…/…`,
 *    eliminating TS2742/TS2883/TS4023 across the monorepo.
 *
 * `zod` is declared in `dependencies` so pnpm installs it transitively for
 * any consumer — they still do not need it in their own package.json.
 *
 * See: docs/veto-monorepo-usage.md for the rationale.
 */
const shared: UserConfig = {
  ...baseConfig,
  // Single public entry; veto does not expose subpaths.
  entry: ['src/index.ts'],
  // Do not auto-generate subpath exports.
  exports: false,
  // Preserve existing output naming used by package.json
  // (`module` -> .mjs, `main` -> .js, single shared .d.ts).
  outExtensions({ format }) {
    return {
      dts: '.d.ts',
      js: format === 'es' ? '.mjs' : '.js',
    };
  },
  // Use the build-specific tsconfig
  tsconfig: 'tsconfig.build.json',
};

export default defineConfig([
  // Pass 1 — runtime JS for ESM + CJS, zod external.
  {
    ...shared,
    dts: false,
  },
  // Pass 2 — single .d.ts with zod's types inlined.
  // - `clean: false` so pass 1's JS output survives.
  // - `format: ['esm']` avoids a dual ESM/CJS dts emit collision (both
  //   formats would write the same `dist/index.d.ts` because of the
  //   forced `outExtensions` above).
  // - `deps.onlyBundle: ['zod']` whitelists zod as the only allowed
  //   inlined dep and turns "unintended dep bundled" into a hard error
  //   if anything else leaks into the .d.ts.
  {
    ...shared,
    clean: false,
    deps: { alwaysBundle: ['zod'], onlyBundle: ['zod'] },
    dts: { emitDtsOnly: true, resolver: 'tsc' },
    format: ['esm'],
  },
]);
