/* eslint-disable n/no-sync */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

/**
 * Validate dependency direction between published workspace packages.
 *
 * This is intentionally a small, explicit architecture policy rather than a
 * generic import linter. It checks runtime manifest relationships, requires
 * workspace ranges for internal packages, rejects dependencies on private
 * build tooling, detects cycles, and prevents source code from reaching into
 * another package's `src` or `dist` implementation.
 *
 * When a new published package or an intentional architecture edge is added,
 * update `allowedRuntimeDependencies` and the architecture section of the root
 * AGENTS.md together.
 */

const root = path.resolve(import.meta.dirname, '..');
const packagesDir = path.join(root, 'packages');

/**
 * Allowed outgoing runtime edges for each published package.
 *
 * Dependencies, optional dependencies, and peer dependencies all participate
 * because each can couple the public package to another workspace package.
 * Development-only tooling is outside this graph.
 */
const allowedRuntimeDependencies = {
  '@fuf-stack/atelier': new Set([
    '@fuf-stack/pixel-utils',
    '@fuf-stack/pixels',
  ]),
  '@fuf-stack/megapixels': new Set([
    '@fuf-stack/pixel-motion',
    '@fuf-stack/pixel-utils',
    '@fuf-stack/pixels',
    '@fuf-stack/uniform',
    '@fuf-stack/veto',
  ]),
  '@fuf-stack/pixel-motion': new Set(),
  '@fuf-stack/pixel-utils': new Set(),
  '@fuf-stack/pixels': new Set([
    '@fuf-stack/pixel-motion',
    '@fuf-stack/pixel-utils',
  ]),
  '@fuf-stack/uniform': new Set([
    '@fuf-stack/pixel-motion',
    '@fuf-stack/pixel-utils',
    '@fuf-stack/pixels',
    '@fuf-stack/veto',
  ]),
  '@fuf-stack/veto': new Set(),
};

const failures = [];
const manifests = new Map();

for (const entry of readdirSync(packagesDir, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name === 'config') continue;
  const file = path.join(packagesDir, entry.name, 'package.json');
  const manifest = JSON.parse(readFileSync(file, 'utf8'));
  if (manifest.private) continue;
  manifests.set(manifest.name, { directory: entry.name, file, manifest });
}

const publishedNames = new Set(manifests.keys());

for (const [name, { directory, manifest }] of manifests) {
  const allowed = allowedRuntimeDependencies[name];
  if (!allowed) {
    failures.push(`${name}: missing dependency policy`);
    continue;
  }

  const runtime = {
    ...manifest.dependencies,
    ...manifest.optionalDependencies,
    ...manifest.peerDependencies,
  };

  for (const [dependency, range] of Object.entries(runtime)) {
    if (dependency.startsWith('@repo/')) {
      failures.push(
        `${name}: private tooling ${dependency} is a runtime dependency`,
      );
    }
    if (!publishedNames.has(dependency)) continue;
    if (!allowed.has(dependency)) {
      failures.push(
        `${name}: dependency on ${dependency} reverses the package boundary`,
      );
    }
    if (!String(range).startsWith('workspace:')) {
      failures.push(
        `${name}: internal dependency ${dependency} must use workspace:`,
      );
    }
  }

  const sourceDir = path.join(packagesDir, directory, 'src');
  if (statExists(sourceDir)) {
    for (const file of walk(sourceDir)) {
      if (!/\.[cm]?[jt]sx?$/.test(file)) continue;
      const source = readFileSync(file, 'utf8');
      const deepImport = /['"](@fuf-stack\/[^/'"]+)\/(?:src|dist)(?:\/|['"])/g;
      for (const match of source.matchAll(deepImport)) {
        failures.push(
          `${path.relative(root, file)}: imports private ${match[1]} implementation`,
        );
      }
    }
  }
}

detectCycles();

if (failures.length) {
  console.error('Dependency boundary violations:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Dependency boundaries valid for ${manifests.size} published packages.`,
);

/** Detect cycles among internal `dependencies` and append readable failures. */
function detectCycles() {
  const visiting = new Set();
  const visited = new Set();

  function visit(name, chain) {
    if (visiting.has(name)) {
      failures.push(
        `workspace dependency cycle: ${[...chain, name].join(' -> ')}`,
      );
      return;
    }
    if (visited.has(name)) return;
    visiting.add(name);
    const dependencies = manifests.get(name)?.manifest.dependencies ?? {};
    for (const dependency of Object.keys(dependencies)) {
      if (publishedNames.has(dependency)) visit(dependency, [...chain, name]);
    }
    visiting.delete(name);
    visited.add(name);
  }

  for (const name of publishedNames) visit(name, []);
}

/** Return whether `file` exists and is a directory without throwing. */
function statExists(file) {
  try {
    return statSync(file).isDirectory();
  } catch {
    return false;
  }
}

/** Yield every file below `directory` recursively. */
function* walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) yield* walk(file);
    else yield file;
  }
}
