import type { ZodBoolean } from 'zod';

import { z } from 'zod';

/**
 * Creates a boolean schema.
 *
 * @example
 * const schema = boolean();
 * schema.parse(true);
 */
export const boolean = (): VBooleanSchema => {
  return z.boolean();
};

export type VBoolean = typeof boolean;
export type VBooleanSchema = ZodBoolean;
