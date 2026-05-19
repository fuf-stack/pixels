// INFO: has to be same as packages/config/vite-config/vite.config.ts
// import currently fails with TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".ts"

/* eslint-disable import-x/no-extraneous-dependencies */

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Automatically resolve TypeScript path mappings from tsconfig.json
  resolve: {
    tsconfigPaths: true,
  },
});
