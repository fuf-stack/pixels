import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { caption, heading, resetColor } from './dist/index.js';

assert.equal(caption, 'text-brand text-caption');
assert.equal(heading({ class: 'text-caption' }), 'text-brand text-caption');

assert.equal(resetColor, 'text-sm text-body');

const css = await readFile(new URL('./dist/theme.css', import.meta.url), 'utf8');
assert.match(css, /\.text-caption\s*\{/);
assert.match(css, /\.text-brand\s*\{/);
assert.match(css, /\.text-sm\s*\{\s*color:/);
