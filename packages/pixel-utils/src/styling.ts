import type { ArgumentArray } from 'classnames';
import type { ConfigExtension } from 'tailwind-merge';
import type { TV, TVConfig } from 'tailwind-variants';

import classNames from 'classnames';
import { extendTailwindMerge, mergeConfigs } from 'tailwind-merge';
import { tv as unmergedTV } from 'tailwind-variants/lite';

import { proseTwMergeClassGroups } from './proseTwMerge';
import semanticMergeConfig from './semanticMergeConfig';
import variantsToClassNames from './slotClassNames';

// Preserve the full callable signature and recipe metadata (including generics).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Recipe = (...args: any[]) => any;
const rawRecipes = new WeakMap<Recipe, Recipe>();

export type StylingConfig = ConfigExtension<string, string>;

export interface Styling {
  readonly cn: (...classes: ArgumentArray) => string;
  /** Resolve a module-level pixel-utils recipe with this instance's merge rules. */
  readonly resolve: <T extends Recipe>(
    recipe: T,
    ...props: Parameters<T>
  ) => ReturnType<T>;
  readonly tv: TV;
  readonly variantsToClassNames: typeof variantsToClassNames;
}

// Configs contain validator functions, so structuredClone is unsuitable.
const copyConfig = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map(copyConfig) as T;
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => {
        return [key, copyConfig(entry)];
      }),
    ) as T;
  }
  return value;
};

/**
 * Creates isolated class helpers. No React or process-global configuration.
 * Recipe classes are concatenated by the lite engine, then merged once, after
 * defaults, variants, compounds, and caller overrides have all been collected.
 */
export const createStyling = (config: StylingConfig = {}): Styling => {
  const instanceConfig = copyConfig(config);
  const merge = extendTailwindMerge<string, string>(
    { extend: { classGroups: proseTwMergeClassGroups } },
    (defaults) => {
      return mergeConfigs(defaults, semanticMergeConfig);
    },
    (defaults) => {
      return mergeConfigs(defaults, instanceConfig);
    },
  );

  const resolveWith = (
    recipe: Recipe,
    props: unknown[],
    merger: (value: string) => string,
  ) => {
    const result = (rawRecipes.get(recipe) ?? recipe)(...props);
    const mergeResult = (value: string | undefined) => {
      return value ? merger(value) || undefined : value;
    };
    if (typeof result !== 'object' || result === null) {
      return mergeResult(result);
    }
    return Object.fromEntries(
      Object.entries(result).map(([slot, fn]) => {
        return [
          slot,
          (...slotProps: unknown[]) => {
            return mergeResult((fn as Recipe)(...slotProps));
          },
        ];
      }),
    );
  };

  // The generic TV signature is unchanged; only its final class resolution is
  // replaced. The lite engine retains metadata for extension without merging.
  const tv = ((options, recipeConfig?: TVConfig) => {
    const raw = unmergedTV(options, { twMerge: false, twMergeConfig: {} });
    const mergeConfig = copyConfig(recipeConfig?.twMergeConfig);
    const shouldMerge = recipeConfig?.twMerge !== false;
    // Keep the legacy top-level config fields accepted by Tailwind Variants.
    const normalizedConfig =
      mergeConfig && typeof mergeConfig !== 'function'
        ? {
            ...mergeConfig,
            extend: {
              theme: mergeConfig.theme,
              classGroups: mergeConfig.classGroups,
              conflictingClassGroupModifiers:
                mergeConfig.conflictingClassGroupModifiers,
              conflictingClassGroups: mergeConfig.conflictingClassGroups,
              ...mergeConfig.extend,
            },
          }
        : mergeConfig;
    const recipeMerge = normalizedConfig
      ? extendTailwindMerge<string, string>(
          { extend: { classGroups: proseTwMergeClassGroups } },
          (defaults) => {
            return mergeConfigs(defaults, semanticMergeConfig);
          },
          (defaults) => {
            return mergeConfigs(defaults, instanceConfig);
          },
          (defaults) => {
            return typeof normalizedConfig === 'function'
              ? normalizedConfig(defaults)
              : mergeConfigs(defaults, normalizedConfig);
          },
        )
      : merge;
    const wrapped = Object.assign((...props: unknown[]) => {
      return resolveWith(
        raw,
        props,
        !shouldMerge
          ? (v) => {
              return v;
            }
          : recipeMerge,
      );
    }, raw);
    rawRecipes.set(wrapped, raw);
    return wrapped;
  }) as TV;

  return Object.freeze({
    cn: (...classes: ArgumentArray) => {
      return merge(classNames(...classes));
    },
    tv,
    variantsToClassNames,
    resolve: (recipe, ...props) => {
      return resolveWith(recipe, props, merge);
    },
  });
};

export const defaultStyling: Styling = createStyling();
