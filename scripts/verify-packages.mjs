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

import { compile } from '@tailwindcss/node';
import { Scanner } from '@tailwindcss/oxide';

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
  .filter((entry) => {
    return entry.isDirectory() && entry.name !== 'config';
  })
  .map((entry) => {
    return path.join(root, 'packages', entry.name);
  });

const packages = packageDirectories
  .map((directory) => {
    return {
      directory,
      manifest: JSON.parse(
        readFileSync(path.join(directory, 'package.json'), 'utf8'),
      ),
    };
  })
  .filter(({ manifest }) => {
    return !manifest.private;
  });

const temporaryDirectory = mkdtempSync(
  path.join(os.tmpdir(), 'pixels-packages-'),
);
const tarballDirectory = path.join(temporaryDirectory, 'tarballs');
const fixtureDirectory = path.join(temporaryDirectory, 'consumer');
mkdirSync(tarballDirectory);
mkdirSync(fixtureDirectory);

try {
  // compile against installed workspace dependencies to catch split date class identities
  run(
    path.join(root, 'node_modules/.bin/tsc'),
    [
      '--ignoreConfig',
      '--noEmit',
      '--strict',
      '--skipLibCheck',
      '--target',
      'ES2022',
      '--module',
      'ESNext',
      '--moduleResolution',
      'Bundler',
      'packages/uniform/test/dts-smoke/date-values.ts',
    ],
    root,
  );

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
  await verifyTokenConsumer();
  await verifyWorkspaceTailwind();
  console.log(
    `Verified declarations, tarballs, and clean installation for ${packages.length} published packages.`,
  );
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}

/** Compile the workspace CSS entry and check recipe discovery without legacy config. */
async function verifyWorkspaceTailwind() {
  const dependencies = [];
  const compiler = await compile(
    '@import "@repo/tailwind-config/tailwind.css";',
    {
      base: root,
      onDependency: (file) => {
        dependencies.push(file);
      },
    },
  );
  const scanner = new Scanner({ sources: compiler.sources });
  const css = compiler.build(scanner.scan());

  // source discovery must reach package components and standalone recipe files
  for (const source of [
    'atelier/src/AtelierFrame/AtelierFrame.tsx',
    'megapixels/src/DataTable/DataTable.tsx',
    'pixels/src/Button/Button.tsx',
    'pixels/src/Button/buttonVariants.ts',
    'uniform/src/Input/Input.tsx',
    'uniform/src/Input/inputVariants.ts',
  ]) {
    const expected = path.join(root, 'packages', source);
    if (!scanner.files.includes(expected)) {
      throw new Error(`Workspace Tailwind sources missed ${source}`);
    }
  }
  if (
    scanner.files.some(
      (file) => file.endsWith('.snap') || file.includes('/dist/'),
    )
  ) {
    throw new Error(
      'Workspace Tailwind must not scan snapshots or generated output.',
    );
  }
  if (dependencies.some((file) => /tailwind\.config\.[cm]?[jt]s$/.test(file))) {
    throw new Error('Workspace Tailwind must not load a legacy config.');
  }
  for (const expected of [
    '.bg-content1',
    '.text-info',
    'color: var(--pixel-color-info)',
    '.rounded-small',
    '.dark\\:autofill',
  ]) {
    if (!css.includes(expected)) {
      throw new Error(`Workspace Tailwind CSS missing ${expected}`);
    }
  }
  if (css.includes('--theme-info')) {
    throw new Error('Workspace theme must use the shared semantic palette.');
  }
  console.log(
    'Verified CSS-first Tailwind 4 workspace compilation and source discovery.',
  );
}

/** Verify token imports and built-package source discovery without HeroUI's plugin. */
async function verifyTokenConsumer() {
  const tokensPath = path.join(
    fixtureDirectory,
    'node_modules/@fuf-stack/pixel-utils/dist/tokens.css',
  );
  const tokens = readFileSync(tokensPath, 'utf8');
  if (tokens.includes('--heroui') || tokens.includes('@repo/')) {
    throw new Error(
      'Owned tokens must not reference HeroUI or private tooling.',
    );
  }
  writeFileSync(
    path.join(fixtureDirectory, 'consumer-styles.html'),
    '<input class="text-sm text-danger text-body bg-content1 border-small border-t-small rounded-small opacity-disabled md:text-body dark:bg-content2 tap-highlight-transparent" />',
  );
  const compiler = await compile(
    '@import "tailwindcss" source(none);\n' +
      '@import "@fuf-stack/pixel-utils/tokens.css";\n' +
      '@source "./consumer-styles.html";\n' +
      '@source "./node_modules/@fuf-stack/pixels/dist";\n' +
      '@theme { --text-body: 1.125rem; }\n',
    { base: fixtureDirectory, onDependency: () => {} },
  );
  const scanner = new Scanner({ sources: compiler.sources });
  const css = compiler.build(scanner.scan());
  for (const expected of [
    '.text-danger',
    'color: var(--pixel-color-danger)',
    '.text-body',
    'font-size: var(--text-body)',
    '.border-small',
    'border-width: var(--pixel-border-width-small)',
    '.border-t-small',
    'border-top-width: var(--pixel-border-width-small)',
    '.md\\:text-body',
    '.dark\\:bg-content2',
    '.rounded-small',
    'border-radius: var(--pixel-radius-small)',
    '.opacity-disabled',
    'opacity: var(--pixel-disabled-opacity)',
    '.tap-highlight-transparent',
    // Comes from the published Json error renderer, not the fixture class list.
    '.bg-danger-50',
    '--pixel-color-content1: #FFFFFF',
    '--pixel-color-content1: #18181b',
  ]) {
    if (!css.toLowerCase().includes(expected.toLowerCase())) {
      throw new Error(`Token consumer missing ${expected}`);
    }
  }
  console.log(
    'Verified owned token CSS and built-package Tailwind source discovery.',
  );
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

  const heroDependencies = [
    'dependencies',
    'peerDependencies',
    'optionalDependencies',
    'devDependencies',
    'inlinedDependencies',
  ]
    .flatMap((section) => {
      return Object.keys(packedManifest[section] ?? {});
    })
    .filter((name) => {
      return name.startsWith('@heroui/');
    });
  if (heroDependencies.length) {
    throw new Error(
      `${manifest.name} must not declare HeroUI dependencies: ${heroDependencies.join(', ')}`,
    );
  }

  const publishedCode = entries.filter((entry) => {
    return /\.(?:mjs|d\.mts|css)$/.test(entry);
  });
  const content = run('tar', ['-xOf', tarball, ...publishedCode], root).stdout;
  if (content.includes('@heroui/') || content.includes('--heroui-')) {
    throw new Error(
      `${manifest.name} runtime, declarations and styles must not reference HeroUI.`,
    );
  }

  if (
    manifest.name === '@fuf-stack/pixel-utils' &&
    /\bheroui\b/.test(content)
  ) {
    throw new Error(
      'pixel-utils must not expose the removed heroui plugin export.',
    );
  }

  if (manifest.name === '@fuf-stack/uniform') {
    const removedHooks = [
      './hooks/useInput',
      './hooks/useUniformField',
      './hooks/useUniformFieldArray',
      './hooks/useUniformFieldState',
      './hooks/useUniformFieldArrayState',
    ];
    if (
      removedHooks.some((subpath) => {
        return subpath in packedManifest.exports;
      })
    ) {
      throw new Error(
        'Uniform must not export removed legacy hooks or private field binding hooks.',
      );
    }
    console.log(
      'Verified Uniform has no direct HeroUI dependencies, runtime/type references or legacy hook exports.',
    );
  }

  if (/workspace:/.test(JSON.stringify(packedManifest))) {
    throw new Error(
      `${manifest.name}: tarball still contains a workspace: range`,
    );
  }
  if (
    entries.some((entry) => {
      return /^package\/(src|test|coverage)\//.test(entry);
    })
  ) {
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
    if (!runtimeTarget || !/\.[cm]?js$/.test(runtimeTarget)) {
      continue;
    }
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
    [...tarballs].map(([name, tarball]) => {
      return [name, `file:${tarball}`];
    }),
  );
  writeFileSync(
    path.join(fixtureDirectory, 'package.json'),
    `${JSON.stringify(
      {
        private: true,
        type: 'module',
        dependencies: {
          ...dependencies,
          react: '18.3.1',
          'react-dom': '18.3.1',
        },
        // Consumer build tooling; no HeroUI theme plugin/configuration is loaded.
        devDependencies: { tailwindcss: '4.3.3' },
      },
      null,
      2,
    )}\n`,
  );

  // pnpm reads overrides from pnpm-workspace.yaml, not package.json.
  // Resolve transitive workspace dependencies to these same local tarballs,
  // including release versions that have not been published to npm yet.
  writeFileSync(
    path.join(fixtureDirectory, 'pnpm-workspace.yaml'),
    `overrides:\n${Object.entries(dependencies)
      .map(([name, tarball]) => {
        return `  ${JSON.stringify(name)}: ${JSON.stringify(tarball)}`;
      })
      .join('\n')}\n`,
  );

  const imports = [];
  for (const { manifest } of packages) {
    for (const [subpath, conditions] of exportEntries(manifest.exports)) {
      const target = runtimeExportTarget(conditions);
      if (!target || target.endsWith('.css') || subpath === './package.json') {
        continue;
      }
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
      .map((specifier, index) => {
        return `import * as publicApi${index} from '${specifier}';\nvoid publicApi${index};`;
      })
      .join('\n')}\n`,
  );
  // Exercise styling generics against packed declarations, not workspace source.
  writeFileSync(
    path.join(fixtureDirectory, 'styling.ts'),
    readFileSync(
      path.join(root, 'packages/pixel-utils/test/dts-smoke/fixture.ts'),
      'utf8',
    ),
  );
  writeFileSync(
    path.join(fixtureDirectory, 'field-associations.ts'),
    readFileSync(
      path.join(root, 'packages/uniform/test/dts-smoke/field-associations.ts'),
      'utf8',
    ),
  );
  writeFileSync(
    path.join(fixtureDirectory, 'buttons.ts'),
    readFileSync(
      path.join(root, 'packages/pixels/test/dts-smoke/buttons.ts'),
      'utf8',
    ),
  );
  writeFileSync(
    path.join(fixtureDirectory, 'popover.ts'),
    readFileSync(
      path.join(root, 'packages/pixels/test/dts-smoke/popover.ts'),
      'utf8',
    ),
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
        files: [
          'consumer.ts',
          'styling.ts',
          'field-associations.ts',
          'buttons.ts',
          'popover.ts',
        ],
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

  // exercise the packed component with the oldest supported React major
  writeFileSync(
    path.join(fixtureDirectory, 'react18.mjs'),
    `import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AvatarGroup } from '@fuf-stack/pixels/AvatarGroup';

assert.match(React.version, /^18\\./);
const markup = renderToStaticMarkup(React.createElement(AvatarGroup, {
  avatars: [{ fallback: 'Alice', src: '' }, { fallback: 'Bob', src: '' }],
  max: 1,
}));
assert.match(markup, /Alice/);
assert.doesNotMatch(markup, /Bob/);
assert.match(markup, /aria-label="\\+1"/);
`,
  );
  run('node', ['react18.mjs'], fixtureDirectory);
  console.log('Verified packed AvatarGroup rendering with React 18.');

  run(
    path.join(root, 'node_modules/.bin/tsc'),
    ['-p', 'tsconfig.json'],
    fixtureDirectory,
  );
}

/** Normalize `exports` shorthand and condition maps into `[subpath, value]`. */
function exportEntries(exportsField) {
  if (typeof exportsField === 'string' || !exportsField) {
    return [['.', exportsField]];
  }
  if (
    !Object.keys(exportsField).some((key) => {
      return key.startsWith('.');
    })
  ) {
    return [['.', exportsField]];
  }
  return Object.entries(exportsField);
}

/** Recursively collect every file target from an exports condition value. */
function exportTargets(value) {
  if (typeof value === 'string') {
    return [value];
  }
  if (!value || typeof value !== 'object') {
    return [];
  }
  return [...new Set(Object.values(value).flatMap(exportTargets))];
}

/** Select the runtime target using the same preferred conditions as ESM tests. */
function runtimeExportTarget(value) {
  if (typeof value === 'string') {
    return value;
  }
  if (!value || typeof value !== 'object') {
    return undefined;
  }
  for (const condition of ['import', 'default', 'require']) {
    const target = runtimeExportTarget(value[condition]);
    if (target) {
      return target;
    }
  }
  return undefined;
}

/** Return an explicit `types` condition when the export declares one. */
function typeExportTarget(value) {
  if (!value || typeof value !== 'object') {
    return undefined;
  }
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
    // Packed runtime/declaration inspection can exceed the default 1 MiB.
    maxBuffer: 16 * 1024 * 1024,
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
