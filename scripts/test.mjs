import { spawnSync } from 'node:child_process';

const [category = 'all', ...args] = process.argv.slice(2);

const commands = {
  all: [['test']],
  unit: [['test:unit']],
  storybook: [['test:storybook']],
  visual: [
    ['--filter', '@repo/storybook-config', 'storybook:build'],
    ['test:visual:docker'],
  ],
  release: [['test:release']],
  dts: [['--filter', '@fuf-stack/veto', 'test:dts']],
};

if (!Object.hasOwn(commands, category)) {
  console.error(`Unknown test category: ${category}`);
  console.error(`Choose ${Object.keys(commands).join(', ')}`);
  process.exit(1);
}

// forward options only to the test runner, leaving preparation commands unchanged
const selected = commands[category];

for (const [index, command] of selected.entries()) {
  const options = index === selected.length - 1 ? args : [];
  const result = spawnSync('pnpm', [...command, ...options], {
    cwd: new URL('../', import.meta.url),
    stdio: 'inherit',
  });

  if (result.error) console.error(result.error.message);

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
