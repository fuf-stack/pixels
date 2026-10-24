/* eslint-disable import-x/no-extraneous-dependencies */
import { copyFile } from 'node:fs/promises';

import { createDepBundledDtsConfig } from '@repo/tsdown-config/config';
import { defineConfig } from 'tsdown';

// We bundle selected dependency types into the generated `.d.ts` so consumers
// do not get type references to pnpm-internal dependency paths.
//
// `classnames` and `slug` are intentionally excluded: their CJS-flavored
// typings currently fail declaration bundling in rolldown-plugin-dts.
const dtsBundledDeps = [/^tailwind-merge($|\/)/, /^tailwind-variants($|\/)/];

// Two-pass build:
// 1) runtime JS output (ESM) with dependencies left external, and
// 2) declaration-only output that bundles only the allowlisted dep types above.
export default defineConfig(
  createDepBundledDtsConfig({
    bundledDeps: dtsBundledDeps,
    exports: false,
    tsconfig: 'tsconfig.build.json',
    firstPassConfig: {
      // Keep Tailwind directives intact for the consuming application's build.
      onSuccess: async () => {
        await copyFile('src/tokens.css', 'dist/tokens.css');
      },
    },
  }),
);
