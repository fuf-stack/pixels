import { spawnSync } from 'node:child_process';

/**
 * Run the complete repository verification suite without failing fast.
 *
 * Each check runs even when an earlier check fails, giving developers and CI a
 * complete report from one invocation. The process still exits unsuccessfully
 * when any check fails, so `pnpm check` remains suitable as a required CI gate.
 */

const checks = [
  ['dependency boundaries', 'check:boundaries'],
  ['lint', 'lint'],
  ['type checking and builds', 'typecheck'],
  ['unit tests', 'test'],
  ['Storybook tests', 'test:storybook'],
  ['published package verification', 'verify:packages'],
];

const failures = [];

for (const [label, script] of checks) {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync('pnpm', ['run', script], {
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    failures.push(label);
    if (result.error) console.error(result.error.message);
  }
}

console.log('\n=== check summary ===');
if (failures.length === 0) {
  console.log(`All ${checks.length} checks passed.`);
} else {
  console.error(
    `${failures.length} of ${checks.length} checks failed: ${failures.join(', ')}.`,
  );
  process.exitCode = 1;
}
