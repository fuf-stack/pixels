import { test } from 'vitest';

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(
  new URL('../packages/config/storybook-config/package.json', import.meta.url),
);
const { parse } = require('yaml');

test('Storybook CI shards cover the complete suite once across isolated runners', () => {
  const workflow = parse(
    readFileSync(
      new URL('../.github/workflows/ci.yml', import.meta.url),
      'utf8',
    ),
  );
  const job = workflow.jobs['storybook-shards'];
  const step = job.steps.find((item) =>
    item.run?.includes('pnpm test:storybook'),
  );
  const match = step?.run.match(
    /--shard=\$\{\{ matrix\.shard \}\}\/([1-9]\d*)\b/,
  );

  assert.ok(match, 'Each runner must execute its matrix shard');

  const count = Number(match[1]);
  assert.ok(count > 1, 'Use multiple runners for parallel Storybook tests');
  assert.deepEqual(
    [...job.strategy.matrix.shard].sort((a, b) => a - b),
    Array.from({ length: count }, (_, index) => index + 1),
    'Shard indices must cover every partition exactly once',
  );
  assert.equal(job.strategy['fail-fast'], false);
  assert.ok(job['runs-on'], 'Shards need separate job runners');

  const summary = workflow.jobs.storybook;
  assert.equal(summary.name, 'Storybook tests');
  assert.deepEqual(summary.needs, ['storybook-shards']);
  assert.equal(summary.if, '${{ always() }}');
  assert.equal(
    summary.steps[0].run,
    'test "${{ needs.storybook-shards.result }}" = success',
  );
});
