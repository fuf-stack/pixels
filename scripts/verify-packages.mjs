/* eslint-disable n/no-sync */

import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * Verify publishable packages exactly as consumers receive them.
 *
 * Preconditions:
 * - workspace packages have already been built;
 * - registry access may be needed when the local pnpm store lacks consumer
 *   dependency metadata.
 *
 * For every non-private package under `packages/*`, this script creates a real
 * pnpm tarball without re-running lifecycle scripts, checks its manifest and
 * export targets, and requires a declaration file beside each JavaScript entry.
 * It then installs all tarballs into one temporary consumer and type-checks
 * imports of every public JavaScript subpath. Browser-oriented packages are not
 * imported in Node because DOM globals are part of their runtime contract.
 * Temporary files are removed on both success and failure.
 */

const root = path.resolve(import.meta.dirname, '..');
const packageDirectories = readdirSync(path.join(root, 'packages'), {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory() && entry.name !== 'config')
  .map((entry) => path.join(root, 'packages', entry.name));

const packages = packageDirectories
  .map((directory) => ({
    directory,
    manifest: JSON.parse(
      readFileSync(path.join(directory, 'package.json'), 'utf8'),
    ),
  }))
  .filter(({ manifest }) => !manifest.private);

const temporaryDirectory = mkdtempSync(
  path.join(os.tmpdir(), 'pixels-packages-'),
);
const tarballDirectory = path.join(temporaryDirectory, 'tarballs');
const fixtureDirectory = path.join(temporaryDirectory, 'consumer');
mkdirSync(tarballDirectory);
mkdirSync(fixtureDirectory);

try {
  const tarballs = new Map();

  for (const packageInfo of packages) {
    const { directory, manifest } = packageInfo;
    run(
      'pnpm',
      ['pack', '--pack-destination', tarballDirectory, '--json'],
      directory,
      { PNPM_CONFIG_IGNORE_SCRIPTS: 'true' },
    );

    const filename = `${manifest.name
      .replace(/^@/, '')
      .replaceAll('/', '-')}-${manifest.version}.tgz`;
    const tarball = path.join(tarballDirectory, filename);
    tarballs.set(manifest.name, tarball);
    inspectTarball(packageInfo, tarball);
  }

  installAndTestConsumer(tarballs);
  console.log(
    `Verified declarations, tarballs, and clean installation for ${packages.length} published packages.`,
  );
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}

/**
 * Check one packed archive for publish-time manifest and file-list mistakes.
 *
 * In addition to missing export targets, this rejects source/test leakage and
 * unresolved `workspace:` ranges, both of which can be invisible when testing
 * through pnpm's workspace symlinks.
 */
function inspectTarball({ manifest }, tarball) {
  const entries = run('tar', ['-tf', tarball], root)
    .stdout.trim()
    .split('\n')
    .filter(Boolean);
  const entrySet = new Set(entries);
  const packedManifest = JSON.parse(
    run('tar', ['-xOf', tarball, 'package/package.json'], root).stdout,
  );

  if (/workspace:/.test(JSON.stringify(packedManifest))) {
    throw new Error(
      `${manifest.name}: tarball still contains a workspace: range`,
    );
  }
  if (entries.some((entry) => /^package\/(src|test|coverage)\//.test(entry))) {
    throw new Error(
      `${manifest.name}: tarball contains source, tests, or coverage`,
    );
  }

  for (const [subpath, conditions] of exportEntries(manifest.exports)) {
    for (const target of exportTargets(conditions)) {
      const normalized = `package/${target.replace(/^\.\//, '')}`;
      if (!entrySet.has(normalized)) {
        throw new Error(
          `${manifest.name}${subpath}: missing exported file ${target}`,
        );
      }
    }

    const runtimeTarget = runtimeExportTarget(conditions);
    if (!runtimeTarget || !/\.[cm]?js$/.test(runtimeTarget)) continue;
    const explicitTypes = typeExportTarget(conditions);
    const inferredTypes = runtimeTarget
      .replace(/\.mjs$/, '.d.mts')
      .replace(/\.js$/, '.d.ts');
    const typesTarget = explicitTypes ?? inferredTypes;
    if (!entrySet.has(`package/${typesTarget.replace(/^\.\//, '')}`)) {
      throw new Error(
        `${manifest.name}${subpath}: missing declaration ${typesTarget}`,
      );
    }
  }
}

/**
 * Install all local tarballs into a clean project and exercise their
 * public entry points through TypeScript and Node's package resolver.
 *
 * Installing the complete package set lets pnpm satisfy internal package edges
 * from the artifacts produced in this run instead of from workspace symlinks.
 */
function installAndTestConsumer(tarballs) {
  const dependencies = Object.fromEntries(
    [...tarballs].map(([name, tarball]) => [name, `file:${tarball}`]),
  );
  writeFileSync(
    path.join(fixtureDirectory, 'package.json'),
    `${JSON.stringify(
      {
        private: true,
        type: 'module',
        dependencies,
        pnpm: { overrides: dependencies },
      },
      null,
      2,
    )}\n`,
  );

  const imports = [];
  for (const { manifest } of packages) {
    for (const [subpath, conditions] of exportEntries(manifest.exports)) {
      const target = runtimeExportTarget(conditions);
      if (!target || target.endsWith('.css') || subpath === './package.json')
        continue;
      imports.push(
        subpath === '.'
          ? manifest.name
          : `${manifest.name}/${subpath.slice(2)}`,
      );
    }
  }

  writeFileSync(
    path.join(fixtureDirectory, 'consumer.ts'),
    `${imports
      .map(
        (specifier, index) =>
          `import * as publicApi${index} from '${specifier}';\nvoid publicApi${index};`,
      )
      .join('\n')}\n`,
  );
  writeFileSync(
    path.join(fixtureDirectory, 'tsconfig.json'),
    `${JSON.stringify(
      {
        compilerOptions: {
          lib: ['ES2022', 'DOM'],
          module: 'ESNext',
          moduleResolution: 'Bundler',
          noEmit: true,
          // Third-party declarations are outside this repository's ownership.
          // Our tarball checks above still require every public declaration,
          // while this compilation verifies consumer-side module resolution.
          skipLibCheck: true,
          strict: true,
          target: 'ES2022',
        },
        files: ['consumer.ts'],
      },
      null,
      2,
    )}\n`,
  );

  run(
    'pnpm',
    ['install', '--prefer-offline', '--ignore-scripts', '--no-frozen-lockfile'],
    fixtureDirectory,
    { PNPM_CONFIG_MINIMUM_RELEASE_AGE: '0' },
  );
  run(
    path.join(root, 'node_modules/.bin/tsc'),
    ['-p', 'tsconfig.json'],
    fixtureDirectory,
  );
}

/** Normalize `exports` shorthand and condition maps into `[subpath, value]`. */
function exportEntries(exportsField) {
  if (typeof exportsField === 'string' || !exportsField)
    return [['.', exportsField]];
  if (!Object.keys(exportsField).some((key) => key.startsWith('.'))) {
    return [['.', exportsField]];
  }
  return Object.entries(exportsField);
}

/** Recursively collect every file target from an exports condition value. */
function exportTargets(value) {
  if (typeof value === 'string') return [value];
  if (!value || typeof value !== 'object') return [];
  return [...new Set(Object.values(value).flatMap(exportTargets))];
}

/** Select the runtime target using the same preferred conditions as ESM tests. */
function runtimeExportTarget(value) {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return undefined;
  for (const condition of ['import', 'default', 'require']) {
    const target = runtimeExportTarget(value[condition]);
    if (target) return target;
  }
  return undefined;
}

/** Return an explicit `types` condition when the export declares one. */
function typeExportTarget(value) {
  if (!value || typeof value !== 'object') return undefined;
  return typeof value.types === 'string'
    ? value.types
    : typeExportTarget(value.types);
}

/**
 * Run a command without a shell and return its captured output.
 *
 * Avoiding a shell keeps generated paths and package names from being parsed as
 * commands. On failure, output is replayed before throwing so CI retains the
 * original tool diagnostic as well as the failed command.
 */
function run(command, args, cwd, extraEnvironment = {}) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, ...extraEnvironment },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.status !== 0) {
    process.stderr.write(result.stdout ?? '');
    process.stderr.write(result.stderr ?? '');
    throw new Error(
      `${command} ${args.join(' ')} failed with exit ${result.status}`,
    );
  }
  return result;
}
