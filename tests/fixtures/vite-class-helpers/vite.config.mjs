import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

import { pixelsTwClassMergeConfig } from '@fuf-stack/pixels-theme/vite';

export default defineConfig({
  resolve: {
    alias: { '@styles': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  plugins: [
    tailwindcss(),
    pixelsTwClassMergeConfig({ tailwindConfig: './src/theme.css' }),
  ],
  build: {
    lib: {
      entry: './src/index.js',
      formats: ['es'],
      fileName: 'index',
      cssFileName: 'theme',
    },
  },
});
