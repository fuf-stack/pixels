/* eslint-disable import-x/no-extraneous-dependencies */
import { libraryBaseConfig } from '@repo/tsdown-config/config';
import { defineConfig } from 'tsdown';

export default defineConfig({
  ...libraryBaseConfig,
  // Keep file names stable per entry (avoid hashed chunk names in published exports).
  unbundle: true,
  // Keep using the package's build-specific tsconfig.
  tsconfig: 'tsconfig.build.json',
  // Keep existing package.json exports stable.
  exports: false,
  // Extract component CSS imports (e.g. `import './Json.styles.css'`) into sibling
  // stylesheet files in dist. Combined with `sideEffects: ["**/*.css"]` in
  // package.json, this lets consumers tree-shake unused components together
  // with their CSS while preserving CSS for the components they use.
  css: {
    splitting: true,
  },
});
