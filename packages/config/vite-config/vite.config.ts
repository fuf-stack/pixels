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
