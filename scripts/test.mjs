import { spawn, spawnSync } from 'node:child_process';
import { availableParallelism, constants } from 'node:os';

const [category = 'all', ...args] = process.argv.slice(2);

const commands = {
  all: [['test:unit'], ['test:storybook']],
  unit: [['test:unit']],
  storybook: [['--filter', '@repo/storybook-config', 'test:storybook']],
  visual: [
    ['--filter', '@repo/storybook-config', 'storybook:build'],
    ['test:visual:docker'],
  ],
  dts: [['--filter', '@fuf-stack/veto', 'test:dts']],
};

if (!Object.hasOwn(commands, category)) {
  console.error(`Unknown test category: ${category}`);
  console.error(`Choose ${Object.keys(commands).join(', ')}`);
  process.exit(1);
}

if (category === 'storybook') {
  const explicitShard = args.some(
    (arg) => arg === '--shard' || arg.startsWith('--shard='),
  );
  // keep focused file filters in one process so empty partitions cannot fail the run
  const focusedRun = args.some((arg) => !arg.startsWith('-'));
  const shardCount =
    explicitShard || focusedRun
      ? 1
      : Number(
          process.env.STORYBOOK_TEST_SHARDS ??
            Math.min(4, availableParallelism()),
        );

  if (!Number.isSafeInteger(shardCount) || shardCount < 1) {
    console.error('STORYBOOK_TEST_SHARDS must be a positive integer');
    process.exit(1);
  }

  // each process owns its browser, server and dependency cache
  const results = await Promise.all(
    Array.from({ length: shardCount }, (_, index) => {
      return new Promise((resolve) => {
        const shard = `${index + 1}/${shardCount}`;
        const shardArgs = shardCount > 1 ? [`--shard=${shard}`] : [];
        console.log(
          `Starting Storybook ${shardCount > 1 ? `shard ${shard}` : 'tests'}`,
        );

        let output = '';
        const child = spawn(
          'pnpm',
          [...commands.storybook[0], ...args, ...shardArgs],
          {
            cwd: new URL('../', import.meta.url),
            stdio: shardCount > 1 ? ['inherit', 'pipe', 'pipe'] : 'inherit',
            env: {
              ...process.env,
              ...(shardCount > 1
                ? { STORYBOOK_TEST_SHARD: `${index + 1}-of-${shardCount}` }
                : {}),
            },
          },
        );

        // pipe non-interactive reporters and print complete shard blocks without overlap
        child.stdout?.on('data', (chunk) => {
          output += chunk;
        });
        child.stderr?.on('data', (chunk) => {
          output += chunk;
        });

        child.once('error', (error) => {
          console.error(error.message);
          resolve(1);
        });
        child.once('close', (code) => {
          if (shardCount > 1) {
            console.log(
              `\n--- Storybook shard ${shard} (${code === 0 ? 'passed' : 'failed'}) ---`,
            );
            process.stdout.write(output);
          }

          resolve(code ?? 1);
        });
      });
    }),
  );

  if (shardCount > 1) {
    console.log('\n=== Storybook summary ===');

    for (const [index, code] of results.entries()) {
      console.log(
        `${code === 0 ? 'PASS' : 'FAIL'} shard ${index + 1}/${shardCount}`,
      );
    }

    const passed = results.filter((code) => code === 0).length;
    console.log(`${passed}/${shardCount} Storybook shards passed.`);
  }

  // finish every shard so one failure does not hide failures in another partition
  process.exitCode = results.find((code) => code !== 0) ?? 0;
} else {
  // forward options to both test categories, but never to visual build preparation
  const selected = commands[category];
  const results = [];
  let exitCode = 0;

  for (const [index, command] of selected.entries()) {
    const options =
      category === 'all' || index === selected.length - 1 ? args : [];
    const result = spawnSync('pnpm', [...command, ...options], {
      cwd: new URL('../', import.meta.url),
      stdio: 'inherit',
    });

    results.push({ name: command[0], passed: result.status === 0 });

    if (result.error) console.error(result.error.message);

    // cancellation must stop the sequence rather than launch the next suite
    if (result.signal === 'SIGINT' || result.signal === 'SIGTERM') {
      process.exit(128 + constants.signals[result.signal]);
    }

    if (result.status !== 0) {
      if (category !== 'all') process.exit(result.status ?? 1);

      // still run browser tests when unit tests fail, preserving the first failure
      exitCode ||= result.status ?? 1;
    }
  }

  if (category === 'all') {
    console.log('\n=== Test summary ===');

    for (const result of results) {
      console.log(`${result.passed ? 'PASS' : 'FAIL'} ${result.name}`);
    }

    const passed = results.filter((result) => result.passed).length;
    console.log(`${passed}/${results.length} test suites passed.`);
  }

  process.exitCode = exitCode;
}
