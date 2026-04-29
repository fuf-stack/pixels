import type { ZodNumber } from 'zod';

import { z } from 'zod';

/**
 * Creates a number schema.
 *
 * @example
 * const schema = number().int().min(1);
 * schema.parse(3);
 */
export const number = (): VNumberSchema => {
  return z.number();
};

export type VNumber = typeof number;
export type VNumberSchema = ZodNumber;
