import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';

import { transformSource } from './transform';

interface CliArgs {
  rootPath: string;
  write: boolean;
}

const SOURCE_FILE_EXTENSIONS = new Set([
  '.cjs',
  '.cts',
  '.js',
  '.jsx',
  '.mjs',
  '.mts',
  '.ts',
  '.tsx',
]);

const SKIP_DIRS = new Set([
  '.git',
  'coverage',
  'dist',
  'node_modules',
  'storybook-static',
]);

const parseCliArgs = (argv: string[]): CliArgs => {
  const write = argv.includes('--write');

  const pathArgIndex = argv.indexOf('--path');
  const rootPath =
    pathArgIndex >= 0 && argv[pathArgIndex + 1]
      ? resolve(argv[pathArgIndex + 1])
      : process.cwd();

  return { rootPath, write };
};

const collectSourceFiles = async (targetPath: string): Promise<string[]> => {
  const entries = await readdir(targetPath, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map(async (entry): Promise<string[]> => {
      const entryPath = join(targetPath, entry.name);

      if (entry.isDirectory()) {
        return SKIP_DIRS.has(entry.name) ? [] : collectSourceFiles(entryPath);
      }

      if (entry.isFile() && SOURCE_FILE_EXTENSIONS.has(extname(entry.name))) {
        return [entryPath];
      }

      return [];
    }),
  );

  return nestedFiles.flat();
};

const run = async () => {
  const { rootPath, write } = parseCliArgs(process.argv.slice(2));
  if (!(await stat(rootPath)).isDirectory()) {
    throw new Error(`Path is not a directory: ${rootPath}`);
  }

  const files = await collectSourceFiles(rootPath);
  let changedFiles = 0;
  let totalWarnings = 0;

  await Promise.all(
    files.map(async (filePath) => {
      const source = await readFile(filePath, 'utf8');
      const result = transformSource(source);

      if (result.changed) {
        changedFiles += 1;
        if (write) {
          await writeFile(filePath, result.code, 'utf8');
        }
        console.log(
          `${write ? 'updated' : 'would update'} ${relative(rootPath, filePath)}`,
        );
      }

      if (result.warnings.length) {
        totalWarnings += result.warnings.length;
        result.warnings.forEach((warning) => {
          console.warn(
            `warning ${relative(rootPath, filePath)}:${warning.line} - ${warning.message}`,
          );
          console.warn(`         ${warning.suggestion}`);
        });
      }
    }),
  );

  console.log(
    `\nProcessed ${files.length} files. ${write ? 'Updated' : 'Would update'} ${changedFiles} files. Found ${totalWarnings} warnings.`,
  );
  if (!write) {
    console.log("Run with '--write' to apply changes.");
  }
};

run().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
