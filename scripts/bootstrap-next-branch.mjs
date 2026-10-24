#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';

const manifestFile = '.release-please-manifest.json';
const nextManifestFile = '.release-please-manifest-next.json';
const nextConfigFile = 'release-please-config-next.json';

const git = (...args) =>
  execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  }).trim();

function gitSucceeds(...args) {
  try {
    git(...args);
    return true;
  } catch (error) {
    if (error.status === 1) return false;
    throw error;
  }
}

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));

function writeJsonIfChanged(file, before, after) {
  if (!isDeepStrictEqual(before, after)) {
    writeFileSync(file, JSON.stringify(after, null, 2) + '\n');
  }
}

function compareCore(a, b) {
  const core = (version) => version.split('-')[0].split('.').map(Number);
  const left = core(a);
  const right = core(b);
  for (let i = 0; i < 3; i++) {
    if (left[i] !== right[i]) return left[i] - right[i];
  }
  return 0;
}

function bootstrap() {
  const args = process.argv.slice(2);
  if (
    args.length > 1 ||
    (args.length === 1 && args[0] !== '--start-new-cycle')
  ) {
    throw new Error(
      'Usage: node scripts/bootstrap-next-branch.mjs [--start-new-cycle]',
    );
  }
  const startNewCycle = args[0] === '--start-new-cycle';
  if (git('status', '--porcelain')) {
    throw new Error('Commit or stash local changes before bootstrapping next.');
  }

  git('fetch', 'origin');
  const bootstrapSha = git('rev-parse', 'origin/main');
  const hasRemoteNext = gitSucceeds(
    'show-ref',
    '--verify',
    '--quiet',
    'refs/remotes/origin/next',
  );
  if (gitSucceeds('show-ref', '--verify', '--quiet', 'refs/heads/next')) {
    git('checkout', 'next');
    if (hasRemoteNext) git('merge', '--ff-only', 'origin/next');
    git('merge', 'origin/main', '--no-edit');
  } else if (hasRemoteNext) {
    git('checkout', '--track', '-b', 'next', 'origin/next');
    git('merge', 'origin/main', '--no-edit');
  } else {
    git('checkout', '-b', 'next', 'origin/main');
  }

  const stableManifest = readJson(manifestFile);
  const previousManifest = readJson(nextManifestFile);
  const previousConfig = readJson(nextConfigFile);
  const nextManifest = Object.fromEntries(
    Object.entries(stableManifest).map(([path, stable]) => {
      const current = previousManifest[path] ?? '0.0.0';
      const preserve =
        !startNewCycle &&
        current.includes('-next.') &&
        compareCore(current, stable) > 0;
      return [
        path,
        preserve ? current : `${Number(stable.split('.')[0]) + 1}.0.0-next.0`,
      ];
    }),
  );
  // bootstrap-sha is a fallback; last-release-sha would override release discovery.
  const nextConfig = {
    ...previousConfig,
    versioning: 'prerelease',
    prerelease: true,
    'prerelease-type': 'next',
    'bootstrap-sha': startNewCycle
      ? bootstrapSha
      : (previousConfig['bootstrap-sha'] ??
        previousConfig['last-release-sha'] ??
        bootstrapSha),
  };
  delete nextConfig['last-release-sha'];

  writeJsonIfChanged(nextManifestFile, previousManifest, nextManifest);
  writeJsonIfChanged(nextConfigFile, previousConfig, nextConfig);
  git('add', nextManifestFile, nextConfigFile);
  if (!gitSucceeds('diff', '--cached', '--quiet')) {
    console.log(
      git(
        'commit',
        '-m',
        startNewCycle
          ? 'chore: start next prerelease cycle'
          : 'chore: bootstrap next branch for prereleases',
      ),
    );
  }
  console.log(
    'Review the next branch, then push with: git push -u origin next',
  );
}

try {
  bootstrap();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
