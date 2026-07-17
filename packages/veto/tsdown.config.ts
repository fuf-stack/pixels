/* eslint-disable import-x/no-extraneous-dependencies */
import { createDepBundledDtsConfig } from '@repo/tsdown-config/config';
import { defineConfig } from 'tsdown';

/**
 * Veto package configuration.
 *
 * `createDepBundledDtsConfig(...)` builds veto in two passes:
 *
 * 1) Runtime pass (ESM):
 *    - emits JS only (`dts: false`)
 *    - leaves `zod` external, so veto and consumers share one runtime zod
 *      instance (important for global error map / registry behavior and
 *      `instanceof ZodType` checks).
 *
 * 2) Declaration pass:
 *    - emits d.ts only (`emitDtsOnly: true`, `format: ['esm']`)
 *    - bundles zod type imports (`/^zod($|\/)/`) into the output declarations,
 *      so consumer type-checking does not depend on pnpm-internal zod paths.
 *
 * Shared defaults come from `libraryBaseConfig`; the options in this file are
 * package-specific overrides.
 *
 * See: docs/veto-monorepo-usage.md for the rationale.
 */
export default defineConfig(
  createDepBundledDtsConfig({
    // Single public entry; veto does not expose subpaths.
    entry: ['src/index.ts'],
    // Do not auto-generate subpath exports.
    exports: false,
    // Use the build-specific tsconfig.
    tsconfig: 'tsconfig.build.json',
    // `alwaysBundle: /^zod($|\/)/` inlines the bare `zod` specifier
    // AND any zod subpath (`zod/v4/core`, …). picomatch on the literal
    // `'zod'` only matches the exact id, so a string pattern would
    // leave `zod/v4/core` external and break the `$Zod*` re-exports.
    bundledDeps: [/^zod($|\/)/],
    dtsPassConfig: {
      // Silence "uses CommonJS dts syntax" noise from `zod/v4/locales/*.d.cts`
      // — zod's `package.json` points `./v4/core`'s `types` at `.d.cts`, so
      // the resolver walks the `locales` namespace into CJS dts files. Locale
      // types aren't part of veto's public surface and the bundled `.d.ts`
      // is correct, so the warnings are noise. Remove once zod fixes that
      // `types` condition or rolldown-plugin-dts exposes resolver conditions.
      inputOptions: {
        onLog(level, log, defaultHandler) {
          const isZodLocaleCjsDtsNoise =
            log.plugin === 'rolldown-plugin-dts:fake-js' &&
            typeof log.message === 'string' &&
            log.message.includes('uses CommonJS dts syntax') &&
            /zod\/v4\/locales\/[^/]+\.d\.cts/.test(log.message);
          if (isZodLocaleCjsDtsNoise) {
            return;
          }
          defaultHandler(level, log);
        },
      },
    },
  }),
);
