import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: { 'vite/index': 'src/vite/index.ts' },
  copy: ['src/css/theme.css', 'src/css/utilities.css'],
  format: 'esm',
  dts: true,
  exports: false,
  sourcemap: true,
});
