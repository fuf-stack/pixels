/* eslint-disable import/prefer-default-export */

import type { Options as SlugOptions } from 'slug';

import slug from 'slug';

interface SlugifyOptions extends SlugOptions {
  /** When true, dots are also replaced (default is false) */
  replaceDots?: boolean;
}

export const slugify = (string: string, options?: SlugifyOptions) => {
  const replacement = options?.replacement || '_';
  const replaceDots = options?.replaceDots || false;

  return slug(string, {
    ...slug.defaults.modes.rfc3986,
    charmap: {
      ...slug.defaults.modes.rfc3986.charmap,
      //  do not replace dots when replaceDots is false
      ...(replaceDots === false ? { '.': '.' } : { '.': replacement }),
      // convert hyphens to underscores (when replacement is not hyphen)
      ...(replacement !== '-' ? { '-': '_' } : {}),
    },
    replacement,
    ...(options || {}),
  });
};
