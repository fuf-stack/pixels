// eslint-disable-next-line import-x/no-extraneous-dependencies
import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src', '!src/**/*.test.*'],
  format: ['cjs', 'esm'],
  sourcemap: true,
});
