import { spawn } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import getVisualTestImage from './getVisualTestImage.mjs';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const workflow = await readFile(
  new URL('../../../../.github/workflows/ci.yml', import.meta.url),
  'utf8',
);
const image = getVisualTestImage(workflow);

await access(new URL('../storybook-static/iframe.html', import.meta.url));

// Docker does not inherit terminal detection or color preferences from the host
const colorEnvironment =
  process.env.NO_COLOR !== undefined
    ? 'NO_COLOR=1'
    : `FORCE_COLOR=${process.env.FORCE_COLOR ?? (process.stdout.isTTY ? '1' : '0')}`;

// run the test server and browser together in CI's Linux environment
const runner = spawn(
  'docker',
  [
    'run',
    '--rm',
    '--init',
    '--ipc=host',
    '--platform',
    'linux/arm64',
    '--env',
    colorEnvironment,
    '--volume',
    `${root}:/workspace`,
    '--workdir',
    '/workspace/packages/config/storybook-config',
    image,
    'node',
    'node_modules/@playwright/test/cli.js',
    'test',
    '--config',
    'playwright.config.mjs',
    ...process.argv.slice(2),
  ],
  { stdio: 'inherit' },
);

process.exitCode = await new Promise((resolve) => {
  runner.on('error', (error) => {
    console.error(error.message);
    resolve(1);
  });
  runner.on('exit', (code) => {
    resolve(code ?? 1);
  });
});
