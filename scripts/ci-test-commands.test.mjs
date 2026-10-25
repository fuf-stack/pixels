import { afterEach, beforeEach, expect, test } from 'vitest';

import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const root = new URL('../', import.meta.url);
let temporaryDirectory;
let log;

beforeEach(() => {
  temporaryDirectory = mkdtempSync(
    path.join(tmpdir(), 'pixels-test-commands-'),
  );
  log = path.join(temporaryDirectory, 'commands.jsonl');

  // record runner invocations without installing dependencies or launching browsers
  writeFileSync(
    path.join(temporaryDirectory, 'pnpm'),
    `#!/bin/sh
"${process.execPath}" -e 'require("node:fs").appendFileSync(process.env.TEST_COMMAND_LOG, JSON.stringify({ args: process.argv.slice(1), cache: process.env.STORYBOOK_TEST_SHARD }) + "\\n")' -- "$@"
if [ -n "\${TEST_COMMAND_OUTPUT:-}" ]; then
  printf 'stdout %s\\n' "\${STORYBOOK_TEST_SHARD}"
  printf 'stderr %s\\n' "\${STORYBOOK_TEST_SHARD}" >&2
fi
if [ -n "\${TEST_COMMAND_DELAY:-}" ]; then
  sleep "$TEST_COMMAND_DELAY"
fi
if [ -n "\${TEST_COMMAND_FAIL_ON:-}" ] && [ "$1" = "$TEST_COMMAND_FAIL_ON" ]; then
  exit 7
fi
if [ "\${STORYBOOK_TEST_SHARD:-}" = "\${TEST_COMMAND_FAIL_SHARD:-not-a-shard}" ]; then
  exit 7
fi
if [ -n "\${TEST_COMMAND_SIGNAL:-}" ]; then
  kill -s "$TEST_COMMAND_SIGNAL" $$
fi
exit "\${TEST_COMMAND_EXIT_CODE:-0}"
`,
    { mode: 0o755 },
  );
});

afterEach(() => {
  rmSync(temporaryDirectory, { recursive: true, force: true });
});

const run = (category, args = [], extraEnvironment = {}) => {
  const result = spawnSync(
    process.execPath,
    ['scripts/test.mjs', category, ...args],
    {
      cwd: root,
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${temporaryDirectory}${path.delimiter}${process.env.PATH}`,
        TEST_COMMAND_LOG: log,
        STORYBOOK_TEST_SHARDS: '2',
        ...extraEnvironment,
      },
    },
  );

  const records = !existsSync(log)
    ? []
    : readFileSync(log, 'utf8').trim().split('\n').map(JSON.parse);

  return { ...result, records, commands: records.map((record) => record.args) };
};

test.each([
  ['unit', 'test:unit', 'test-unit'],
  ['dts', ['--filter', '@fuf-stack/veto', 'test:dts'], 'test-dts'],
])('runs only the selected category: %s', (category, command, target) => {
  const result = run(category, ['--example-option']);
  expect(result.status).toBe(0);
  expect(result.commands).toEqual([
    [...(Array.isArray(command) ? command : [command]), '--example-option'],
  ]);

  const make = spawnSync('make', ['--dry-run', target], {
    cwd: root,
    encoding: 'utf8',
  });
  expect(make.status).toBe(0);
  expect(make.stdout).toContain(`node scripts/test.mjs ${category}`);
});

test('builds Storybook before visual comparisons and forwards options only to the runner', () => {
  const result = run('visual', ['--grep=uniform-input']);
  expect(result.status).toBe(0);
  expect(result.commands).toEqual([
    ['--filter', '@repo/storybook-config', 'storybook:build'],
    ['test:visual:docker', '--grep=uniform-input'],
  ]);

  const make = spawnSync('make', ['--dry-run', 'test-visual'], {
    cwd: root,
    encoding: 'utf8',
  });
  expect(make.stdout).toContain('node scripts/test.mjs visual');
});

test('stops after a failed preparation command and preserves its exit status', () => {
  const result = run('visual', [], { TEST_COMMAND_EXIT_CODE: '7' });
  expect(result.status).toBe(7);
  expect(result.commands).toEqual([
    ['--filter', '@repo/storybook-config', 'storybook:build'],
  ]);
});

test('rejects an unknown category without starting a runner', () => {
  const result = run('unknown');
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('Unknown test category');
  expect(result.commands).toEqual([]);
});

test('runs local Storybook shards with separate caches and forwards runner options', () => {
  const result = run('storybook', ['--testNamePattern=Keyboard']);
  expect(result.status).toBe(0);
  expect(result.records.sort((a, b) => a.cache.localeCompare(b.cache))).toEqual(
    [
      {
        args: [
          '--filter',
          '@repo/storybook-config',
          'test:storybook',
          '--testNamePattern=Keyboard',
          '--shard=1/2',
        ],
        cache: '1-of-2',
      },
      {
        args: [
          '--filter',
          '@repo/storybook-config',
          'test:storybook',
          '--testNamePattern=Keyboard',
          '--shard=2/2',
        ],
        cache: '2-of-2',
      },
    ],
  );

  const make = spawnSync('make', ['--dry-run', 'test-storybook'], {
    cwd: root,
    encoding: 'utf8',
  });
  expect(make.stdout).toContain('node scripts/test.mjs storybook');
});

test.each([['--shard=3/4'], ['--shard', '3/4']])(
  'does not reshard an explicit CI partition: %j',
  (...args) => {
    const result = run('storybook', args);
    expect(result.status).toBe(0);
    expect(result.commands).toEqual([
      ['--filter', '@repo/storybook-config', 'test:storybook', ...args],
    ]);
  },
);

test('can run the whole Storybook suite in one process', () => {
  const result = run('storybook', [], { STORYBOOK_TEST_SHARDS: '1' });
  expect(result.status).toBe(0);
  expect(result.commands).toEqual([
    ['--filter', '@repo/storybook-config', 'test:storybook'],
  ]);
});

test('reports a failing shard after collecting every partition', () => {
  const result = run('storybook', [], { TEST_COMMAND_EXIT_CODE: '7' });
  expect(result.status).toBe(7);
  expect(result.commands).toHaveLength(2);
});

test.each(['0', 'invalid', '2.5'])(
  'rejects invalid local shard counts: %s',
  (count) => {
    const result = run('storybook', [], { STORYBOOK_TEST_SHARDS: count });
    expect(result.status).toBe(1);
    expect(result.commands).toEqual([]);
    expect(result.stderr).toContain(
      'STORYBOOK_TEST_SHARDS must be a positive integer',
    );
  },
);

test('runs unit, parallel Storybook and prepared visual tests for the full suite', () => {
  const result = run('all', ['--testNamePattern=Keyboard']);
  expect(result.status).toBe(0);
  expect(result.commands).toEqual([
    ['test:unit', '--testNamePattern=Keyboard'],
    ['test:storybook', '--testNamePattern=Keyboard'],
    ['--filter', '@repo/storybook-config', 'storybook:build'],
    ['test:visual:docker'],
  ]);

  const make = spawnSync('make', ['--dry-run', 'test'], {
    cwd: root,
    encoding: 'utf8',
  });
  expect(make.stdout).toContain('node scripts/test.mjs all');
});

test('runs every category after a failure and skips comparisons after failed preparation', () => {
  const result = run('all', [], { TEST_COMMAND_EXIT_CODE: '7' });
  expect(result.status).toBe(7);
  expect(result.commands).toEqual([
    ['test:unit'],
    ['test:storybook'],
    ['--filter', '@repo/storybook-config', 'storybook:build'],
  ]);
});

test('groups shard stdout and stderr into complete non-interactive blocks', () => {
  const result = run('storybook', [], { TEST_COMMAND_OUTPUT: '1' });
  expect(result.status).toBe(0);

  const blocks = result.stdout.split('--- Storybook shard ').slice(1);
  expect(blocks).toHaveLength(2);

  for (const block of blocks) {
    const index = block.startsWith('1/2') ? 1 : 2;
    const other = index === 1 ? 2 : 1;
    expect(block).toContain(`${index}/2 (passed)`);
    expect(block).toContain(`stdout ${index}-of-2`);
    expect(block).toContain(`stderr ${index}-of-2`);
    expect(block).not.toContain(`stdout ${other}-of-2`);
    expect(block).not.toContain(`stderr ${other}-of-2`);
  }
});

test.each(['test:unit', 'test:storybook', 'test:visual:docker'])(
  'summarizes every suite and preserves the failure of %s',
  (failed) => {
    const result = run('all', [], { TEST_COMMAND_FAIL_ON: failed });
    expect(result.status).toBe(7);
    expect(result.commands).toEqual([
      ['test:unit'],
      ['test:storybook'],
      ['--filter', '@repo/storybook-config', 'storybook:build'],
      ['test:visual:docker'],
    ]);

    for (const [command, label] of [
      ['test:unit', 'test:unit'],
      ['test:storybook', 'test:storybook'],
      ['test:visual:docker', 'test:visual'],
    ]) {
      expect(result.stdout).toMatch(
        new RegExp(
          String.raw`${failed === command ? 'FAIL' : 'PASS'} ${label} \(\d+\.\ds\)`,
        ),
      );
    }

    expect(result.stdout).toContain('2/3 test suites passed.');
  },
);

test('reports failed visual preparation without comparing stale output', () => {
  const result = run('all', [], { TEST_COMMAND_FAIL_ON: '--filter' });
  expect(result.status).toBe(7);
  expect(result.commands).toEqual([
    ['test:unit'],
    ['test:storybook'],
    ['--filter', '@repo/storybook-config', 'storybook:build'],
  ]);
  expect(result.stdout).toContain('FAIL test:visual');
  expect(result.stdout).toContain('2/3 test suites passed.');
});

test('summarizes a successful full test run with category and total runtimes', () => {
  const result = run('all', [], { TEST_COMMAND_DELAY: '0.1' });
  expect(result.status).toBe(0);

  const summary = result.stdout.split('=== Test summary ===')[1];
  const durations = [...summary.matchAll(/PASS test:([a-z]+) \((\d+\.\d)s\)/g)];
  expect(durations.map((match) => match[1])).toEqual([
    'unit',
    'storybook',
    'visual',
  ]);
  expect(Number(durations[0][2])).toBeGreaterThanOrEqual(0.1);
  expect(Number(durations[1][2])).toBeGreaterThanOrEqual(0.1);
  // visual runtime includes both the build and the comparison command
  expect(Number(durations[2][2])).toBeGreaterThanOrEqual(0.2);
  expect(summary).toContain('3/3 test suites passed.');

  const total = summary.match(/Total runtime: (\d+\.\d)s/);
  expect(total).not.toBeNull();
  expect(Number(total[1])).toBeGreaterThanOrEqual(0.4);
});

test.each([1, 2])(
  'includes every Storybook shard in the final summary when shard %s fails',
  (index) => {
    const result = run('storybook', [], {
      TEST_COMMAND_FAIL_SHARD: `${index}-of-2`,
    });
    expect(result.status).toBe(7);
    expect(result.stdout).toContain('=== Storybook summary ===');
    expect(result.stdout).toContain(
      `${index === 1 ? 'FAIL' : 'PASS'} shard 1/2`,
    );
    expect(result.stdout).toContain(
      `${index === 2 ? 'FAIL' : 'PASS'} shard 2/2`,
    );
    expect(result.stdout).toContain('1/2 Storybook shards passed.');
  },
);

test.each([
  ['Modal.interactions.stories.tsx'],
  ['Modal', '--testNamePattern=Keyboard'],
])(
  'runs a focused file filter once without hiding empty-filter failures: %j',
  (...args) => {
    const result = run('storybook', args);
    expect(result.status).toBe(0);
    expect(result.commands).toEqual([
      ['--filter', '@repo/storybook-config', 'test:storybook', ...args],
    ]);
  },
);

test('stops the full sequence when the unit runner is terminated', () => {
  const result = run('all', [], { TEST_COMMAND_SIGNAL: 'TERM' });
  expect(result.status).toBe(143);
  expect(result.commands).toEqual([['test:unit']]);
});
