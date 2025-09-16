/* eslint-disable n/no-sync */
/* eslint-disable import-x/no-extraneous-dependencies */

import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

import { defineConfig } from 'tsup';

function getAllFilePaths(dirPath: string): string[] {
  return readdirSync(dirPath).reduce<string[]>((allFiles, file) => {
    const fullPath = path.join(dirPath, file);
    if (statSync(fullPath).isDirectory()) {
      return allFiles.concat(getAllFilePaths(fullPath));
    }
    return allFiles.concat(`./${fullPath}`);
  }, []);
}

export default defineConfig({
  entry: getAllFilePaths('./src')
    .flat()
    .filter((file) => {
      return file.endsWith('index.ts');
    }),
  format: ['esm', 'cjs'],
  splitting: true,
  sourcemap: true,
  clean: true,
  dts: true,
  outDir: 'dist',
  // update exports of package.json
  onSuccess: async () => {
    const packageJsonPath = './package.json';
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const distIndexFiles = getAllFilePaths('./dist')
      .filter((file) => {
        return file.endsWith('index.js');
      })
      .sort((a, b) => {
        // move index export to top
        if (a === './dist/index.js') {
          return -1;
        }
        if (b === './dist/index.js') {
          return 1;
        }
        return a.localeCompare(b);
      });

    packageJson.exports = distIndexFiles.reduce<
      Record<string, { import: string; require: string; types: string }>
    >((exports, file) => {
      const key = file.replace('dist/', '').replace('/index.js', '');
      // eslint-disable-next-line no-param-reassign
      exports[key] = {
        types: file.replace('.js', '.d.ts'),
        import: file,
        require: file.replace('.js', '.cjs'),
      };

      // include css exports
      // https://github.com/vitejs/vite/discussions/2657
      const cssPath = file.replace('.js', '.css');
      // Check if a corresponding CSS file exists
      if (cssPath !== './dist/index.css' && existsSync(cssPath)) {
        // @ts-expect-error this is ok
        // eslint-disable-next-line no-param-reassign
        exports[`${key}.css`] = {
          import: cssPath,
          require: cssPath,
        };
      }

      return exports;
    }, {});

    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  },
});
