import type { Plugin, ResolvedConfig } from 'vite';

import { readdir, readFile, realpath } from 'node:fs/promises';
import { builtinModules } from 'node:module';
import path from 'node:path';

import { normalizePath } from 'vite';

import readTheme from './readTheme';

const configImport = './twClassMergeConfig.js';
const virtualConfig = '\0virtual:pixels/tw-class-merge-config';
const consumers = [
  'pixel-utils',
  'pixels',
  'uniform',
  'atelier',
  'megapixels',
].map((name) => {
  return `@fuf-stack/${name}`;
});

// CommonJS dependencies of pixel-utils' class and slug helpers
const helperSpecifiers = ['classnames', 'slug'];
// fallback when pixel-utils' build cannot be read
const helperDependencies = helperSpecifiers.map((specifier) => {
  return `@fuf-stack/pixel-utils > ${specifier}`;
});

/** The specifier an include entry resolves, such as debug for a > b > debug. */
const entrySpecifier = (entry: string) => {
  return entry.split(' > ').pop() ?? entry;
};

// static imports, re-exports and dynamic imports of bare specifiers
const importPattern = /(?:\bfrom\s*|\bimport\s*\(?\s*)["']([^"'./][^"']*)["']/g;

/** Package name of a bare specifier, such as react-aria for react-aria/useFocusRing. */
const packageName = (specifier: string) => {
  const parts = specifier.split('/');
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
};

/** Whether the optimizer can prebundle a specifier. */
const isOptimizable = (specifier: string) => {
  return (
    !specifier.startsWith('node:') &&
    !builtinModules.includes(specifier) &&
    !specifier.startsWith('virtual:') &&
    !specifier.endsWith('.css')
  );
};

/** Locate an installed package like Node does, independent of its exports. */
const findPackage = async (
  from: string,
  name: string,
): Promise<string | null> => {
  const candidate = path.join(from, 'node_modules', name);
  try {
    const manifest = JSON.parse(
      await readFile(path.join(candidate, 'package.json'), 'utf8'),
    ) as { name?: string };
    if (manifest.name === name) {
      return await realpath(candidate);
    }
  } catch {
    // not installed at this level
  }
  const parent = path.dirname(from);
  return parent === from ? null : findPackage(parent, name);
};

/** Bare imports in a package's build output. */
const readBuildImports = async (packageDirectory: string) => {
  const dist = path.join(packageDirectory, 'dist');
  let entries: string[];
  try {
    entries = await readdir(dist, { recursive: true });
  } catch {
    return [];
  }
  const sources = await Promise.all(
    entries
      .filter((entry) => {
        return /\.(?:mjs|js)$/.test(entry);
      })
      .map(async (entry) => {
        return readFile(path.join(dist, entry), 'utf8');
      }),
  );
  const specifiers = sources.flatMap((source) => {
    return [...source.matchAll(importPattern)].map((match) => {
      return match[1];
    });
  });
  return [...new Set(specifiers)].filter(isOptimizable);
};

/** Include entries for a consumer's imports, following nested consumers. */
const collectImports = async (
  chain: string,
  directory: string,
  visited: Set<string>,
): Promise<string[]> => {
  if (visited.has(directory)) {
    return [];
  }
  visited.add(directory);
  const nested = await Promise.all(
    (await readBuildImports(directory)).map(async (specifier) => {
      const name = packageName(specifier);
      if (!consumers.includes(name)) {
        return [`${chain} > ${specifier}`];
      }
      const consumer = await findPackage(directory, name);
      return consumer
        ? collectImports(`${chain} > ${name}`, consumer, visited)
        : [];
    }),
  );
  return nested.flat();
};

/**
 * Dependencies the optimizer cannot discover itself
 *
 * Excluded packages are served as source, so Vite does not scan their imports.
 * CommonJS dependencies would reach the browser unconverted, and React Aria
 * subpaths would load beside the prebundled copies with separate contexts.
 * Consumers reached only through another consumer get a chained path.
 */
const consumerDependencies = async (root: string) => {
  const visited = new Set<string>();
  const installed = await Promise.all(
    consumers.map(async (name) => {
      return { name, directory: await findPackage(root, name) };
    }),
  );
  const imports = await Promise.all(
    installed.map(async ({ name, directory }) => {
      return directory ? collectImports(name, directory, visited) : [];
    }),
  );
  return imports.flat();
};

/** Keep one entry per specifier, the optimizer resolves it once. */
const uniqueBySpecifier = (entries: string[]) => {
  return entries.filter((entry, index) => {
    return (
      entries.findIndex((other) => {
        return entrySpecifier(other) === entrySpecifier(entry);
      }) === index
    );
  });
};

/** Compile the project's Tailwind stylesheet into the config used by cn and tv. */
export function pixelsTwClassMergeConfig({
  tailwindConfig,
}: {
  /** Path to the Tailwind CSS entry, relative to the Vite root or absolute. */
  tailwindConfig: string;
}): Plugin {
  let file: string;
  let root: string;
  let discovered: Promise<string[]> | undefined;
  let resolveCss: ReturnType<ResolvedConfig['createResolver']>;
  const dependencies = new Set<string>();
  return {
    name: 'pixels:tw-class-merge-config',
    enforce: 'pre',
    async configEnvironment(name) {
      // Server environments load CommonJS dependencies natively. Astro has
      // separate server environments for prerendering and on-demand SSR.
      discovered ??= consumerDependencies(root);
      // Discovered paths come first, they also resolve pixel-utils when it is
      // installed only below another consumer.
      const entries = uniqueBySpecifier([
        ...(await discovered),
        ...helperDependencies,
      ]);
      const include =
        name === 'client'
          ? entries
          : entries.filter((entry) => {
              return helperSpecifiers.includes(entrySpecifier(entry));
            });
      return {
        resolve: { noExternal: consumers },
        optimizeDeps: {
          exclude: consumers,
          include,
        },
      };
    },
    config(config) {
      root = path.resolve(config.root ?? process.cwd());
      file = path.resolve(root, tailwindConfig);
    },
    configResolved(config) {
      resolveCss = config.createResolver({
        ...config.resolve,
        extensions: ['.css'],
        mainFields: ['style'],
        conditions: ['style', 'development|production'],
        preferRelative: true,
        tryIndex: false,
      });
    },
    async resolveId(id, importer) {
      if (id !== configImport || !importer) {
        return null;
      }
      const resolved = await this.resolve(id, importer, { skipSelf: true });
      if (!resolved) {
        return null;
      }
      // Only replace pixel-utils' configuration, never an application's file
      // that happens to use the same relative import name.
      const manifest = path.resolve(
        path.dirname(resolved.id),
        '../package.json',
      );
      try {
        const metadata = JSON.parse(await readFile(manifest, 'utf8')) as {
          name?: string;
        };
        return metadata.name === '@fuf-stack/pixel-utils'
          ? virtualConfig
          : null;
      } catch {
        return null;
      }
    },
    hotUpdate({ file: changed }) {
      if (!dependencies.has(changed)) {
        return;
      }
      const module = this.environment.moduleGraph.getModuleById(virtualConfig);
      if (module) {
        this.environment.moduleGraph.invalidateModule(module);
        if (this.environment.name === 'client') {
          this.environment.hot.send({ type: 'full-reload' });
        }
      }
    },
    async load(id) {
      if (id !== virtualConfig) {
        return null;
      }
      const config = await readTheme(
        file,
        (dependency) => {
          // Vite reports changed files with forward slashes, also on Windows.
          dependencies.add(normalizePath(dependency));
          this.addWatchFile(dependency);
        },
        async (specifier, base) => {
          return resolveCss(specifier, path.join(base, 'index.css'));
        },
      );
      return `export default ${JSON.stringify(config)};`;
    },
  };
}

export { readTheme };
