/* eslint-disable import-x/no-extraneous-dependencies */
import { createDepBundledDtsConfig } from '@repo/tsdown-config/config';
import { defineConfig } from 'tsdown';

// We bundle selected dependency types into the generated `.d.ts` so consumers
// do not get type references to pnpm-internal dependency paths.
//
// `classnames` and `slug` are intentionally excluded: their CJS-flavored
// typings currently fail declaration bundling in rolldown-plugin-dts.
const dtsBundledDeps = [
  /^@heroui\/theme($|\/)/,
  // Transitive type dependency of @heroui/theme declarations.
  /^tailwindcss($|\/)/,
  /^tailwind-merge($|\/)/,
  /^tailwind-variants($|\/)/,
];

// Two-pass build:
// 1) runtime JS output (ESM) with dependencies left external, and
// 2) declaration-only output that bundles only the allowlisted dep types above.
export default defineConfig(
  createDepBundledDtsConfig({
    bundledDeps: dtsBundledDeps,
    tsconfig: 'tsconfig.build.json',
  }),
);
