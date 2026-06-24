/* eslint-disable import-x/prefer-default-export */

import type {
  AtelierRenderer,
  AtelierRendererProps,
  AtelierRendererRegistry,
  AtelierResourceDefinition,
} from './types';

/**
 * Resolves the renderer for a resource:
 * 1) inline `resource.renderer`
 * 2) registry lookup via `resource.rendererId`
 * 3) text-based fallback renderer for loading/ready/empty/error states
 */
export const getResourceRenderer = (
  resource: AtelierResourceDefinition,
  registry: AtelierRendererRegistry = {},
): AtelierRenderer => {
  if (resource.renderer) {
    return resource.renderer;
  }

  if (resource.rendererId && registry[resource.rendererId]) {
    return registry[resource.rendererId];
  }

  return ({ error, state, title }: AtelierRendererProps) => {
    if (state === 'loading') {
      return `${title ?? resource.title} is loading...`;
    }

    if (state === 'error') {
      const suffix = error instanceof Error ? ` (${error.message})` : '';
      return `${title ?? resource.title} failed${suffix}`;
    }

    if (state === 'empty') {
      return `${title ?? resource.title} has no data`;
    }

    return `${title ?? resource.title} is ready`;
  };
};
