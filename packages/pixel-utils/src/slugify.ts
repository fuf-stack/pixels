/* eslint-disable import/prefer-default-export */

import type { Options as SlugOptions } from 'slug';

import slug from 'slug';

export const slugify = (string: string, options?: SlugOptions) => {
  const replacement = options?.replacement || '_';
  return slug(string, {
    ...slug.defaults.modes.rfc3986,
    charmap: {
      ...slug.defaults.modes.rfc3986.charmap,
      // allow dots by default
      '.': '.',
      // convert hyphens to underscores (when replacement is not hyphen)
      ...(replacement !== '-' ? { '-': '_' } : {}),
    },
    replacement,
    ...(options || {}),
  });
};
