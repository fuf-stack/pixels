import type { ZodLiteral } from 'zod';

import { z } from 'zod';

type VLiteralPrimitive = string | number | boolean | bigint | null | undefined;

/**
 * Creates a literal-value schema.
 *
 * @example
 * const schema = literal('ONLY');
 * schema.parse('ONLY');
 */
export const literal = <T extends VLiteralPrimitive>(
  value: T,
): VLiteralSchema<T> => {
  return z.literal(value);
};

export type VLiteral = typeof literal;
export type VLiteralSchema<T extends VLiteralPrimitive> = ZodLiteral<T>;
