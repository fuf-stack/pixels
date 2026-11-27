/* eslint-disable import-x/no-extraneous-dependencies */
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

import { createDepBundledDtsConfig } from '@repo/tsdown-config/config';
import { format, resolveConfig } from 'prettier';
import { defineConfig } from 'tsdown';

import { readTheme } from '@fuf-stack/pixels-theme/vite';

// We bundle selected dependency types into the generated `.d.ts` so consumers
// do not get type references to pnpm-internal dependency paths.
//
// `classnames` and `slug` are intentionally excluded: their CJS-flavored
// typings currently fail declaration bundling in rolldown-plugin-dts.
const dtsBundledDeps = [/^tailwind-merge($|\/)/, /^tailwind-variants($|\/)/];

// Two-pass build:
// 1) runtime JS output (ESM) with dependencies left external, and
// 2) declaration-only output that bundles only the allowlisted dep types above.
export default defineConfig(async () => {
  // Generate an ordinary source module so editors, tests and lint resolve the
  // same defaults as the published package, without a private import alias.
  const css = createRequire(import.meta.url).resolve(
    '@fuf-stack/pixels-theme/theme.css',
  );
  const config = await readTheme(css);
  const sourceFile = 'src/twClassMergeConfig.ts';
  const source = await format(
    `// Generated from @fuf-stack/pixels-theme/theme.css by pnpm build.
` +
      `// Do not edit this configuration directly.
` +
      `import type { ConfigExtension } from 'tailwind-merge';

` +
      `const twClassMergeConfig = ${JSON.stringify(config)} satisfies ConfigExtension<string, string>;

` +
      `export default twClassMergeConfig;
`,
    { ...(await resolveConfig(sourceFile)), filepath: sourceFile },
  );
  const current = await readFile(sourceFile, 'utf8').catch(() => {
    return undefined;
  });
  if (current !== source) {
    await writeFile(sourceFile, source);
  }
  return createDepBundledDtsConfig({
    bundledDeps: dtsBundledDeps,
    exports: false,
    tsconfig: 'tsconfig.build.json',
    firstPassConfig: {
      // Keep the configuration replaceable by the Vite plugin.
      deps: { neverBundle: ['./twClassMergeConfig.js'] },
      async onSuccess() {
        await writeFile(
          'dist/twClassMergeConfig.js',
          `export default ${JSON.stringify(config)};\n`,
        );
      },
    },
  });
});
