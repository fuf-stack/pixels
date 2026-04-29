import type { ZodLiteral } from 'zod';

import { z } from 'zod';

type VLiteralPrimitive = string | number | boolean | bigint | null | undefined;

export const literal = <T extends VLiteralPrimitive>(
  value: T,
): VLiteralSchema<T> => {
  return z.literal(value);
};

export type VLiteral = typeof literal;
export type VLiteralSchema<T extends VLiteralPrimitive> = ZodLiteral<T>;
