import { test } from 'vitest';

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(
  new URL('../packages/config/storybook-config/package.json', import.meta.url),
);
const { getStorySortParameter } = require('storybook/internal/csf-tools');

for (const directory of [
  'config/storybook-config',
  'megapixels',
  'pixels',
  'uniform',
]) {
  test(`${directory} exposes scenario ordering to Storybook's static extractor`, () => {
    const file = new URL(
      `../packages/${directory}/.storybook/preview.tsx`,
      import.meta.url,
    );
    const sort = getStorySortParameter(readFileSync(file, 'utf8'));

    // shared-preview spreads are not evaluated by the indexer
    assert.equal(sort?.includeNames, true);
    assert.equal(sort?.method, 'configure');
    assert.deepEqual(sort?.order, [
      '*',
      ['*', ['Default', '*', 'Composition', 'Interactions', 'Edge Cases']],
    ]);
  });
}
