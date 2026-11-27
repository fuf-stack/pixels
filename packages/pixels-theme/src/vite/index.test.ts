import type { Plugin } from 'vite';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { pixelsTwClassMergeConfig } from '.';

let directory: string;
const configImport = './twClassMergeConfig.js';
const virtualConfig = '\0virtual:pixels/tw-class-merge-config';

// Vite supports both a direct callback and an object with a handler for hooks.
function handler<T extends (...args: never[]) => unknown>(
  hook: T | { handler: T } | undefined,
): T {
  if (typeof hook === 'function') {
    return hook;
  }
  if (hook) {
    return hook.handler;
  }
  throw new Error('Expected a Vite plugin hook');
}

beforeEach(async () => {
  directory = await realpath(
    await mkdtemp(path.join(os.tmpdir(), 'pixels-vite-theme-')),
  );
  await writeFile(path.join(directory, 'theme.css'), '@import "./tokens.css";');
  await writeFile(
    path.join(directory, 'tokens.css'),
    '@theme { --text-body: 1rem; }',
  );
});

afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

function setupPlugin(tailwindConfig = 'theme.css') {
  const plugin = pixelsTwClassMergeConfig({ tailwindConfig });
  Reflect.apply(handler(plugin.config), undefined, [{ root: directory }, {}]);
  const resolveCss = vi.fn(async (id: string, importer: string) =>
    path.resolve(path.dirname(importer), id),
  );
  const createResolver = vi.fn(() => resolveCss);
  Reflect.apply(handler(plugin.configResolved), undefined, [
    { resolve: {}, createResolver },
  ]);
  return { plugin, createResolver, resolveCss };
}

async function load(plugin: Plugin, id = virtualConfig) {
  const addWatchFile = vi.fn<(file: string) => void>();
  const source: unknown = await Reflect.apply(
    handler(plugin.load),
    { addWatchFile },
    [id],
  );
  return { source, addWatchFile };
}

function environment(name = 'client', hasModule = true) {
  const module = { id: virtualConfig };
  const getModuleById = vi.fn(() => (hasModule ? module : undefined));
  const invalidateModule = vi.fn();
  const send = vi.fn();
  return {
    environment: {
      name,
      moduleGraph: { getModuleById, invalidateModule },
      hot: { send },
    },
    module,
  };
}

describe('virtual merge configuration', () => {
  it.each(['src', 'dist'])(
    'replaces only pixel-utils configuration resolved from %s',
    async (folder) => {
      const packageDirectory = path.join(directory, 'pixel-utils');
      await mkdir(path.join(packageDirectory, folder), { recursive: true });
      await writeFile(
        path.join(packageDirectory, 'package.json'),
        JSON.stringify({ name: '@fuf-stack/pixel-utils' }),
      );
      const resolvedFile = path.join(
        packageDirectory,
        folder,
        folder === 'src' ? 'twClassMergeConfig.ts' : 'twClassMergeConfig.js',
      );
      const importer = path.join(packageDirectory, folder, 'index.mjs');
      const resolve = vi.fn(async () => ({ id: resolvedFile }));
      const { plugin } = setupPlugin();

      expect(
        await Reflect.apply(handler(plugin.resolveId), { resolve }, [
          configImport,
          importer,
        ]),
      ).toBe(virtualConfig);
      expect(resolve).toHaveBeenCalledWith(configImport, importer, {
        skipSelf: true,
      });
    },
  );

  it('does not replace an application module with the same relative name', async () => {
    await writeFile(
      path.join(directory, 'package.json'),
      JSON.stringify({ name: 'application' }),
    );
    const resolve = vi.fn(async () => ({
      id: path.join(directory, 'src/twClassMergeConfig.js'),
    }));
    const { plugin } = setupPlugin();

    expect(
      await Reflect.apply(handler(plugin.resolveId), { resolve }, [
        configImport,
        path.join(directory, 'src/index.js'),
      ]),
    ).toBeNull();
  });

  it('ignores unrelated imports, missing importers and unresolved files', async () => {
    const resolve = vi.fn(async () => null);
    const { plugin } = setupPlugin();
    const importer = path.join(directory, 'src/index.js');

    expect(
      await Reflect.apply(handler(plugin.resolveId), { resolve }, [
        'other-module',
        importer,
      ]),
    ).toBeNull();
    expect(
      await Reflect.apply(handler(plugin.resolveId), { resolve }, [
        configImport,
      ]),
    ).toBeNull();
    expect(resolve).not.toHaveBeenCalled();
    expect(
      await Reflect.apply(handler(plugin.resolveId), { resolve }, [
        configImport,
        importer,
      ]),
    ).toBeNull();
  });

  it('ignores modules whose owning package cannot be identified', async () => {
    const resolve = vi.fn(async () => ({
      id: path.join(directory, 'src/twClassMergeConfig.js'),
    }));
    const { plugin } = setupPlugin();

    expect(
      await Reflect.apply(handler(plugin.resolveId), { resolve }, [
        configImport,
        path.join(directory, 'src/index.js'),
      ]),
    ).toBeNull();
  });

  it('loads a serialized configuration, resolves CSS imports and watches dependencies', async () => {
    const { plugin, createResolver, resolveCss } = setupPlugin();
    const { source, addWatchFile } = await load(plugin);

    expect(createResolver).toHaveBeenCalledWith(
      expect.objectContaining({
        extensions: ['.css'],
        mainFields: ['style'],
        preferRelative: true,
      }),
    );
    expect(resolveCss).toHaveBeenCalledWith(
      './tokens.css',
      path.join(directory, 'index.css'),
    );
    expect(addWatchFile.mock.calls.map(([file]) => file)).toEqual(
      expect.arrayContaining([
        path.join(directory, 'theme.css'),
        path.join(directory, 'tokens.css'),
      ]),
    );
    expect(source).toBe(
      'export default {"extend":{"theme":{"text":["body"]},"classGroups":{}}};',
    );
    expect((await load(plugin, 'unrelated')).source).toBeNull();
  });

  it('accepts an absolute stylesheet path independently of the Vite root', async () => {
    const file = path.join(directory, 'tokens.css');
    const { plugin } = setupPlugin(file);
    Reflect.apply(handler(plugin.config), undefined, [
      { root: path.join(directory, 'other-root') },
      {},
    ]);

    const { source, addWatchFile } = await load(plugin);
    expect(source).toContain('"text":["body"]');
    expect(addWatchFile).toHaveBeenCalledWith(file);
  });

  it('reads updated tokens when the virtual module loads again', async () => {
    const { plugin } = setupPlugin();
    await load(plugin);
    await writeFile(
      path.join(directory, 'tokens.css'),
      '@theme { --text-caption: 0.75rem; }',
    );

    const { source } = await load(plugin);
    expect(source).toContain('"text":["caption"]');
    expect(source).not.toContain('body');
  });
});

describe('Vite environments', () => {
  it.each(['client', 'ssr', 'prerender'])(
    'bundles helper consumers in %s without requiring the component package',
    async (name) => {
      const { plugin } = setupPlugin();
      const config: unknown = await Reflect.apply(
        handler(plugin.configEnvironment),
        undefined,
        [name, {}],
      );

      expect(config).toEqual({
        resolve: {
          noExternal: [
            '@fuf-stack/pixel-utils',
            '@fuf-stack/pixels',
            '@fuf-stack/uniform',
            '@fuf-stack/atelier',
            '@fuf-stack/megapixels',
          ],
        },
        optimizeDeps: {
          exclude: [
            '@fuf-stack/pixel-utils',
            '@fuf-stack/pixels',
            '@fuf-stack/uniform',
            '@fuf-stack/atelier',
            '@fuf-stack/megapixels',
          ],
          include: [
            '@fuf-stack/pixel-utils > classnames',
            '@fuf-stack/pixel-utils > slug',
          ],
        },
      });
    },
  );

  it('prebundles the build imports of installed consumers only for the client', async () => {
    // a stylesheet outside the package that installs the components
    await mkdir(path.join(directory, 'styles'), { recursive: true });
    await writeFile(path.join(directory, 'styles/theme.css'), '');
    const install = async (
      at: string,
      name: string,
      files: Record<string, string>,
    ) => {
      const packageDirectory = path.join(at, 'node_modules', name);
      await mkdir(path.join(packageDirectory, 'dist/chunks'), {
        recursive: true,
      });
      await writeFile(
        path.join(packageDirectory, 'package.json'),
        JSON.stringify({ name }),
      );
      await Promise.all(
        Object.entries(files).map(async ([file, source]) =>
          writeFile(path.join(packageDirectory, 'dist', file), source),
        ),
      );
      return packageDirectory;
    };
    const uniform = await install(directory, '@fuf-stack/uniform', {
      'index.mjs': [
        'import createDebug from "debug";',
        'import { Button } from "@fuf-stack/pixels/Button";',
        'import "./styles.css";',
        'import { readFile } from "node:fs";',
      ].join('\n'),
    });
    // only reachable through uniform, as with pnpm
    const pixels = await install(uniform, '@fuf-stack/pixels', {
      'index.mjs': [
        'export * from "react-aria-components";',
        'export { cn } from "@fuf-stack/pixel-utils";',
      ].join('\n'),
      'chunks/Button.mjs': [
        'import { useFocusRing } from "react-aria/useFocusRing";',
        'const lazy = () => import("react-stately/useToggleState");',
      ].join('\n'),
    });
    await install(pixels, '@fuf-stack/pixel-utils', {
      'index.mjs': [
        'import classNames from "classnames";',
        'import slug from "slug";',
      ].join('\n'),
    });
    const { plugin } = setupPlugin('styles/theme.css');

    const clientConfig: unknown = await Reflect.apply(
      handler(plugin.configEnvironment),
      undefined,
      ['client', {}],
    );
    const serverConfig: unknown = await Reflect.apply(
      handler(plugin.configEnvironment),
      undefined,
      ['ssr', {}],
    );

    expect(clientConfig).toMatchObject({
      optimizeDeps: {
        include: [
          '@fuf-stack/uniform > debug',
          '@fuf-stack/uniform > @fuf-stack/pixels > react-aria-components',
          '@fuf-stack/uniform > @fuf-stack/pixels > @fuf-stack/pixel-utils > classnames',
          '@fuf-stack/uniform > @fuf-stack/pixels > @fuf-stack/pixel-utils > slug',
          '@fuf-stack/uniform > @fuf-stack/pixels > react-aria/useFocusRing',
          '@fuf-stack/uniform > @fuf-stack/pixels > react-stately/useToggleState',
        ],
      },
    });
    // pixel-utils is not installed at the root, so the fallback paths would
    // not resolve
    expect(serverConfig).toMatchObject({
      optimizeDeps: {
        include: [
          '@fuf-stack/uniform > @fuf-stack/pixels > @fuf-stack/pixel-utils > classnames',
          '@fuf-stack/uniform > @fuf-stack/pixels > @fuf-stack/pixel-utils > slug',
        ],
      },
    });
  });
});

describe('theme hot updates', () => {
  it.each(['theme.css', 'tokens.css'])(
    'invalidates the virtual module and reloads the client for %s',
    async (name) => {
      const { plugin } = setupPlugin();
      await load(plugin);
      const context = environment();
      Reflect.apply(handler(plugin.hotUpdate), context, [
        { file: path.join(directory, name) },
      ]);

      expect(
        context.environment.moduleGraph.getModuleById,
      ).toHaveBeenCalledWith(virtualConfig);
      expect(
        context.environment.moduleGraph.invalidateModule,
      ).toHaveBeenCalledWith(context.module);
      expect(context.environment.hot.send).toHaveBeenCalledWith({
        type: 'full-reload',
      });
    },
  );

  it('invalidates server-side configuration without sending a browser reload', async () => {
    const { plugin } = setupPlugin();
    await load(plugin);
    const context = environment('ssr');
    Reflect.apply(handler(plugin.hotUpdate), context, [
      { file: path.join(directory, 'tokens.css') },
    ]);

    expect(
      context.environment.moduleGraph.invalidateModule,
    ).toHaveBeenCalledWith(context.module);
    expect(context.environment.hot.send).not.toHaveBeenCalled();
  });

  it('matches Windows paths against the forward slashes Vite reports', async () => {
    vi.resetModules();
    vi.doMock('./readTheme', () => ({
      default: async (_file: string, watch: (dependency: string) => void) => {
        watch('C:\\app\\styles\\tokens.css');
        return {};
      },
    }));
    // Vite's normalizePath as it behaves on Windows
    vi.doMock('vite', () => ({
      normalizePath: (id: string) => id.replaceAll('\\', '/'),
    }));
    try {
      const { pixelsTwClassMergeConfig: windowsPlugin } = await import('.');
      const plugin = windowsPlugin({ tailwindConfig: 'theme.css' });
      Reflect.apply(handler(plugin.config), undefined, [
        { root: directory },
        {},
      ]);
      await load(plugin);
      const context = environment();
      Reflect.apply(handler(plugin.hotUpdate), context, [
        { file: 'C:/app/styles/tokens.css' },
      ]);

      expect(context.environment.hot.send).toHaveBeenCalledWith({
        type: 'full-reload',
      });
    } finally {
      vi.doUnmock('./readTheme');
      vi.doUnmock('vite');
      vi.resetModules();
    }
  });

  it('ignores unrelated files and unloaded virtual modules', async () => {
    const { plugin } = setupPlugin();
    await load(plugin);
    const context = environment();
    Reflect.apply(handler(plugin.hotUpdate), context, [
      { file: path.join(directory, 'other.css') },
    ]);
    expect(
      context.environment.moduleGraph.getModuleById,
    ).not.toHaveBeenCalled();

    const unloaded = environment('client', false);
    Reflect.apply(handler(plugin.hotUpdate), unloaded, [
      { file: path.join(directory, 'tokens.css') },
    ]);
    expect(
      unloaded.environment.moduleGraph.invalidateModule,
    ).not.toHaveBeenCalled();
    expect(unloaded.environment.hot.send).not.toHaveBeenCalled();
  });
});
