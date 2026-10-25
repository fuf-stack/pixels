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
"${process.execPath}" -e 'require("node:fs").appendFileSync(process.env.TEST_COMMAND_LOG, JSON.stringify(process.argv.slice(1)) + "\\n")' -- "$@"
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
        ...extraEnvironment,
      },
    },
  );

  const commands = !existsSync(log)
    ? []
    : readFileSync(log, 'utf8').trim().split('\n').map(JSON.parse);

  return { ...result, commands };
};

test.each([
  ['all', 'test', 'test'],
  ['unit', 'test:unit', 'test-unit'],
  ['storybook', 'test:storybook', 'test-storybook'],
  ['release', 'test:release', 'test-release'],
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
