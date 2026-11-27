import { createRequire } from 'node:module';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { pixelsTwClassMergeConfig } from '@fuf-stack/pixels-theme/vite';

// Resolve the shared Tailwind CSS entry independently of the directory that starts Vite.
const tailwindConfig = createRequire(import.meta.url).resolve(
  '@repo/tailwind-config/tailwind.css',
);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    pixelsTwClassMergeConfig({ tailwindConfig }),
  ],

  // Automatically resolve TypeScript path mappings from tsconfig.json
  resolve: {
    tsconfigPaths: true,
  },
});
