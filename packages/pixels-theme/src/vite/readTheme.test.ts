import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { extendTailwindMerge } from 'tailwind-merge';

import readTheme from './readTheme';

let directory: string;

beforeEach(async () => {
  directory = await realpath(
    await mkdtemp(path.join(os.tmpdir(), 'pixels-read-theme-')),
  );
});

afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

async function stylesheet(name: string, css: string) {
  const file = path.join(directory, name);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, css);
  return file;
}

describe('project theme tokens', () => {
  it('keeps project text sizes distinct from colors and ignores companion tokens', async () => {
    const file = await stylesheet(
      'theme.css',
      `
      @theme {
        --text-body: 1rem;
        --text-body--line-height: 1.5;
        --color-brand: #3254cd;
        --font-brand: Georgia;
        --font-weight-book: 450;
        --radius-panel: 1rem;
        --drop-shadow-card: 0 1px 2px black;
      }
    `,
    );
    const config = await readTheme(file);
    const merge = extendTailwindMerge(config);

    expect(merge('text-lg text-brand', 'text-body')).toBe(
      'text-brand text-body',
    );
    expect(merge('font-sans font-bold', 'font-brand font-book')).toBe(
      'font-brand font-book',
    );
    expect(merge('rounded-lg', 'rounded-panel')).toBe('rounded-panel');
    expect(merge('drop-shadow-sm', 'drop-shadow-card')).toBe(
      'drop-shadow-card',
    );
    expect(config.extend?.theme?.text).toEqual(['body']);
    expect(config.extend?.theme?.color).toBeUndefined();
  });

  it('uses the final theme after imported presets, resets and inline overrides', async () => {
    await stylesheet(
      'preset.css',
      `
      @theme { --text-sm: 0.875rem; --text-old: 2rem; }
    `,
    );
    const file = await stylesheet(
      'theme.css',
      `
      @import './preset.css';
      @theme { --text-*: initial; --color-sm: red; }
      @theme inline { --text-body: var(--app-body); }
    `,
    );
    const config = await readTheme(file);
    const merge = extendTailwindMerge(config);

    expect(config.extend?.theme?.text).toEqual(['body']);
    expect(merge('text-sm', 'text-body')).toBe('text-sm text-body');
    expect(merge('text-red-500', 'text-sm')).toBe('text-sm');
  });

  it('treats text classes as colors when a color and a text size share a name', async () => {
    // Tailwind compiles text-sm and text-body to colors here
    const file = await stylesheet(
      'theme.css',
      `
      @theme {
        --text-sm: 0.875rem;
        --color-sm: red;
        --text-body: 1rem;
        --color-body: blue;
        --text-caption: 0.75rem;
      }
    `,
    );
    const config = await readTheme(file);
    const merge = extendTailwindMerge(config);

    expect(config.extend?.theme?.text).toEqual(['caption']);
    expect(merge('text-caption', 'text-sm')).toBe('text-caption text-sm');
    expect(merge('text-caption', 'text-body')).toBe('text-caption text-body');
    expect(merge('text-red-500', 'text-sm')).toBe('text-sm');
  });

  it('keeps background image tokens apart from background colors', async () => {
    const file = await stylesheet(
      'theme.css',
      `
      @theme {
        --background-image-hero: linear-gradient(red, blue);
        --color-brand: teal;
      }
    `,
    );
    const merge = extendTailwindMerge(await readTheme(file));

    expect(merge('bg-brand', 'bg-hero')).toBe('bg-brand bg-hero');
    expect(merge('bg-none', 'bg-hero')).toBe('bg-hero');
  });

  it('recognizes custom border widths on physical and logical sides', async () => {
    const file = await stylesheet(
      'theme.css',
      '@theme { --border-width-control: 3px; }',
    );
    const merge = extendTailwindMerge(await readTheme(file));

    ['', '-x', '-y', '-t', '-r', '-b', '-l', '-s', '-e', '-bs', '-be'].forEach(
      (side) => {
        expect(
          merge(`border${side}-2 border-red-500`, `border${side}-control`),
        ).toBe(`border-red-500 border${side}-control`);
      },
    );
  });

  it('preserves the Tailwind prefix when merging project classes', async () => {
    await stylesheet('tokens.css', '@theme { --text-body: 1rem; }');
    const file = await stylesheet(
      'theme.css',
      '@import "./tokens.css" prefix(app);',
    );
    const config = await readTheme(file);

    expect(config.prefix).toBe('app');
    expect(
      extendTailwindMerge(config)(
        'app:text-lg app:text-brand',
        'app:text-body',
      ),
    ).toBe('app:text-brand app:text-body');
  });
});

describe('custom CSS utilities', () => {
  it('merges supported single-property utilities, transitions and explicit hints', async () => {
    const file = await stylesheet(
      'theme.css',
      `
      @utility opacity-muted { opacity: 0.5; }
      @utility bg-stripes { background-image: linear-gradient(red, blue); }
      @utility bg-stripe-size { background-size: 1rem 1rem; }
      @utility text-caption { font-size: 0.75rem; }
      @utility transition-panel {
        transition-property: width, height;
        transition-duration: 150ms;
      }
      @utility text-prose {
        /* @merge-group font-size */
        font-size: 1.1rem;
        line-height: 1.6;
      }
    `,
    );
    const merge = extendTailwindMerge(await readTheme(file));

    expect(merge('opacity-100', 'opacity-muted')).toBe('opacity-muted');
    expect(merge('bg-none', 'bg-stripes')).toBe('bg-stripes');
    expect(merge('bg-cover', 'bg-stripe-size')).toBe('bg-stripe-size');
    expect(merge('text-lg text-brand', 'text-caption')).toBe(
      'text-brand text-caption',
    );
    expect(merge('transition-all', 'transition-panel')).toBe(
      'transition-panel',
    );
    expect(merge('text-lg text-brand', 'text-prose')).toBe(
      'text-brand text-prose',
    );
  });

  it('keeps ambiguous, nested and wildcard utilities out of inferred merge groups', async () => {
    const file = await stylesheet(
      'theme.css',
      `
      @utility mixed { opacity: 0.5; transform: scale(0.9); }
      @utility nested { &:hover { opacity: 0.5; } }
      @utility custom-* { opacity: --value(number); }
      @utility layout { display: block; }
    `,
    );
    const config = await readTheme(file);
    const classes = 'opacity-100 mixed nested custom-50 block layout';

    expect(config.extend?.classGroups).toEqual({});
    expect(extendTailwindMerge(config)(classes)).toBe(classes);
  });
});

describe('stylesheet and module dependencies', () => {
  it('resolves nested relative imports and tracks every stylesheet', async () => {
    const utility = await stylesheet(
      'presets/utilities.css',
      '@utility opacity-muted { opacity: 0.5; }',
    );
    const preset = await stylesheet(
      'presets/theme.css',
      '@import "./utilities.css"; @theme { --text-body: 1rem; }',
    );
    const file = await stylesheet(
      'theme.css',
      '@import "./presets/theme.css";',
    );
    const onDependency = vi.fn<(file: string) => void>();
    const merge = extendTailwindMerge(await readTheme(file, onDependency));

    expect(onDependency.mock.calls.map(([dependency]) => dependency)).toEqual(
      expect.arrayContaining([file, preset, utility]),
    );
    expect(merge('text-lg opacity-100', 'text-body opacity-muted')).toBe(
      'text-body opacity-muted',
    );
  });

  it('uses a caller resolver for aliased imports', async () => {
    const tokens = await stylesheet(
      'tokens.css',
      '@theme { --radius-panel: 1rem; }',
    );
    const file = await stylesheet('theme.css', '@import "@tokens";');
    const resolveImport = vi.fn(async () => tokens);
    const config = await readTheme(file, undefined, resolveImport);

    expect(resolveImport).toHaveBeenCalledWith('@tokens', directory);
    expect(extendTailwindMerge(config)('rounded-lg', 'rounded-panel')).toBe(
      'rounded-panel',
    );
  });

  it('loads JavaScript config tokens and tracks the config dependency', async () => {
    const configFile = await stylesheet(
      'tailwind.config.mjs',
      'export default { theme: { extend: { fontSize: { caption: "0.75rem" } } } };',
    );
    const file = await stylesheet(
      'theme.css',
      '@config "./tailwind.config.mjs";',
    );
    const onDependency = vi.fn<(file: string) => void>();
    const config = await readTheme(file, onDependency);

    expect(onDependency).toHaveBeenCalledWith(configFile);
    expect(extendTailwindMerge(config)('text-lg', 'text-caption')).toBe(
      'text-caption',
    );
  });

  it('reports unresolved CSS imports with the specifier and base directory', async () => {
    const file = await stylesheet('theme.css', '@import "@missing";');

    await expect(
      readTheme(file, undefined, async () => undefined),
    ).rejects.toThrow(`Cannot resolve CSS import @missing from ${directory}`);
  });

  it('propagates stylesheet read errors', async () => {
    await expect(
      readTheme(path.join(directory, 'missing.css')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });
});
