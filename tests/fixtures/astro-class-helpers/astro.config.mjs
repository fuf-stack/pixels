import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

import { pixelsTwClassMergeConfig } from '@fuf-stack/pixels-theme/vite';

export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [
      tailwindcss(),
      pixelsTwClassMergeConfig({ tailwindConfig: './src/theme.css' }),
    ],
  },
});
