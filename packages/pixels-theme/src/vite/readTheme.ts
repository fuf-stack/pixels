import type { ConfigExtension } from 'tailwind-merge';

import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { loadModule } from '@tailwindcss/node';
import enhancedResolve from 'enhanced-resolve';
import { getDefaultConfig, validators } from 'tailwind-merge';

import postcss from 'postcss';
import { __unstable__loadDesignSystem as loadDesignSystem } from 'tailwindcss';

// Match the CSS entry of packages such as tailwindcss, including nested imports.
const resolveCss = enhancedResolve.create.sync({
  extensions: ['.css'],
  conditionNames: ['style'],
  mainFields: ['style', 'main'],
});

const namespaces = Object.keys(getDefaultConfig().theme)
  .filter((name) => {
    return name !== 'color';
  }) // tailwind-merge accepts project color names by default
  .sort((a, b) => {
    return b.length - a.length;
  });

const propertyGroups: Record<string, string> = {
  opacity: 'opacity',
  'background-image': 'bg-image',
  'background-size': 'bg-size',
  'font-size': 'font-size',
};

function collectUtilities(
  css: string,
  file: string,
  addClass: (group: string, name: string) => void,
) {
  postcss.parse(css, { from: file }).walkAtRules('utility', (rule) => {
    if (!rule.nodes || rule.params.includes('*')) {
      return;
    }
    const hint = rule.nodes.find((node) => {
      return node.type === 'comment' && node.text.startsWith('@merge-group ');
    });
    const flat = rule.nodes.every((node) => {
      return node.type === 'decl' || node.type === 'comment';
    });
    const properties = rule.nodes
      .filter((node) => {
        return node.type === 'decl';
      })
      .map((node) => {
        return node.prop;
      });
    let group =
      hint?.type === 'comment'
        ? hint.text.slice('@merge-group '.length).trim()
        : undefined;
    if (
      !group &&
      flat &&
      properties.includes('transition-property') &&
      properties.every((prop) => {
        return prop.startsWith('transition-');
      })
    ) {
      group = 'transition';
    }
    if (!group && flat && properties.length === 1) {
      group = propertyGroups[properties[0]];
    }
    if (group) {
      addClass(group, rule.params);
    }
  });
}

/** Let Tailwind resolve @theme, inline tokens, resets and imported presets. */
export default async function readTheme(
  file: string,
  onDependency: (file: string) => void = () => {},
  resolveImport: (
    id: string,
    base: string,
  ) => Promise<string | undefined> = async (id, base) => {
    return resolveCss(base, id) || undefined;
  },
): Promise<ConfigExtension<string, string>> {
  const classGroups: Record<string, string[]> = {};
  async function readStylesheet(filename: string) {
    onDependency(filename);
    const css = await readFile(filename, 'utf8');
    collectUtilities(css, filename, (group, name) => {
      (classGroups[group] ??= []).push(name);
    });
    return css;
  }
  const design = await loadDesignSystem(await readStylesheet(file), {
    base: path.dirname(file),
    async loadStylesheet(id, base) {
      const filename = await resolveImport(id, base);
      if (!filename) {
        throw new Error(`Cannot resolve CSS import ${id} from ${base}`);
      }
      return {
        path: filename,
        base: path.dirname(filename),
        content: await readStylesheet(filename),
      };
    },
    loadModule: async (id, base) => {
      return loadModule(id, base, onDependency);
    },
  });
  const theme: Record<string, string[]> = {};
  Array.from(design.theme.entries()).forEach(([key]) => {
    const token = key.slice(
      design.theme.prefix ? design.theme.prefix.length + 3 : 2,
    );
    if (token.includes('--')) {
      return;
    } // e.g. --text-body--line-height
    if (token.startsWith('color-')) {
      const name = token.slice('color-'.length);
      // Tailwind resolves text-{name} to the color when a text size has the
      // same name, and a reset can turn a built-in size name into a color.
      if (
        name === 'base' ||
        validators.isTshirtSize(name) ||
        design.theme.get([`--text-${name}`])
      ) {
        (classGroups['text-color'] ??= []).push(`text-${name}`);
      }
      return;
    }
    if (token.startsWith('background-image-')) {
      // bg-{name} sets background-image, not background-color
      (classGroups['bg-image'] ??= []).push(
        `bg-${token.slice('background-image-'.length)}`,
      );
      return;
    }
    if (token.startsWith('border-width-')) {
      const width = token.slice('border-width-'.length);
      [
        '',
        '-x',
        '-y',
        '-t',
        '-r',
        '-b',
        '-l',
        '-s',
        '-e',
        '-bs',
        '-be',
      ].forEach((side) => {
        (classGroups[`border-w${side}`] ??= []).push(`border${side}-${width}`);
      });
      return;
    }
    const namespace = namespaces.find((name) => {
      return token.startsWith(`${name}-`);
    });
    const value = token.slice(namespace ? namespace.length + 1 : 0);
    // a color with the same name takes text-{name}, see above
    if (
      namespace &&
      !(namespace === 'text' && design.theme.get([`--color-${value}`]))
    ) {
      (theme[namespace] ??= []).push(value);
    }
  });
  return {
    ...(design.theme.prefix && { prefix: design.theme.prefix }),
    extend: { theme, classGroups },
  };
}
