export default {
  // Run related unit tests once for all staged runtime-package files.
  // Storybook browser tests run separately through pnpm test:storybook.
  'packages/{atelier,megapixels,pixel-motion,pixel-utils,pixels,uniform,veto}/**/*.{js,ts,tsx}':
    ['vitest related --run --project=!@repo/storybook-config*', 'eslint'],
  // config packages
  'packages/config/**/*.{js,ts}': ['eslint'],
  // other filetypes
  '*.{json,md,mdx,yaml,yml}': ['prettier --write'],
};
