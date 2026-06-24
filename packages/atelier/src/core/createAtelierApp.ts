/* eslint-disable import-x/prefer-default-export */

import type { AtelierAppConfig, AtelierNavigationSection } from './types';

import { createAuthAdapter } from './createAuthAdapter';

/**
 * Clones and sanitizes navigation config by dropping empty sections.
 */
const normalizeNavigation = (
  sections?: AtelierNavigationSection[],
): AtelierNavigationSection[] => {
  if (!sections || sections.length <= 0) {
    return [];
  }

  return sections
    .filter((section) => {
      return section.items.length > 0;
    })
    .map((section) => {
      return {
        ...section,
        items: [...section.items],
      };
    });
};

/**
 * Creates a normalized app config object for shell usage.
 *
 * Normalization goals:
 * - always provide an auth adapter with defaults
 * - always provide collections (`navigation`, `renderers`, `resources`)
 * - remove empty navigation sections
 */
export const createAtelierApp = (
  config: AtelierAppConfig,
): Required<
  Pick<AtelierAppConfig, 'appName' | 'navigation' | 'renderers' | 'resources'>
> &
  AtelierAppConfig => {
  return {
    ...config,
    auth: createAuthAdapter(config.auth),
    navigation: normalizeNavigation(config.navigation),
    renderers: config.renderers ?? {},
    resources: config.resources ?? [],
  };
};
