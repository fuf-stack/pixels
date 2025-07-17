module.exports = {
  // pixel-motion
  'packages/pixel-motion/**/*.{js,ts,tsx}': ['eslint'],
  // pixel-utils
  'packages/pixel-utils/**/*.{js,ts,tsx}': ['eslint'],
  // pixels
  'packages/pixels/**/*.{js,ts,tsx}': ['vitest related --run', 'eslint'],
  // uniform
  'packages/uniform/**/*.{js,ts,tsx}': ['vitest related --run', 'eslint'],
  // veto
  'packages/veto/**/*.{js,ts,tsx}': ['vitest related --run', 'eslint'],
  // config packages
  'packages/config/**/*.{js,ts}': ['eslint'],
  // other filetypes
  '*.{json,md,mdx,yaml,yml}': ['prettier --write'],
};
