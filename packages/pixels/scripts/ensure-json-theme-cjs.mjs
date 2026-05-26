import { constants } from 'node:fs';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * TEMPORARY CJS COMPATIBILITY SHIM
 *
 * Keep this script only as long as we publish/maintain CommonJS output.
 * The CJS Json bundle currently references `./theme.cjs`, so we create a
 * no-op file to satisfy that import in Node/Jest environments.
 *
 * Once CJS support is dropped (ESM-only distribution), this script and the
 * `theme.cjs` shim should be removed.
 */

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, '..');
const jsonDistDir = resolve(projectRoot, 'dist', 'Json');
const themeCssPath = resolve(jsonDistDir, 'theme.css');
const themeCjsPath = resolve(jsonDistDir, 'theme.cjs');

const themeCjsContents = `'use strict';

// Intentionally empty: this file only exists to satisfy CJS
// side-effect imports emitted by the bundler for Json styles.
`;

const ensureThemeCjs = async () => {
  try {
    await access(themeCssPath, constants.F_OK);
  } catch {
    // Skip creating the CJS side-effect stub when Json CSS was not emitted.
    return;
  }

  await mkdir(jsonDistDir, { recursive: true });
  await writeFile(themeCjsPath, themeCjsContents, 'utf8');
};

await ensureThemeCjs();
