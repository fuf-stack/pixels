import { z } from 'zod';

type ZodDiscriminatedUnionFactory = typeof z.discriminatedUnion;
type ZodDiscriminatedUnionArgs = Parameters<ZodDiscriminatedUnionFactory>;

export type VDiscriminatedUnionSchema =
  ReturnType<ZodDiscriminatedUnionFactory>;

/**
 * Creates a discriminated union schema.
 *
 * @example
 * const schema = discriminatedUnion('type', [
 *   z.object({ type: z.literal('a'), value: z.string() }),
 *   z.object({ type: z.literal('b'), count: z.number() }),
 * ]);
 */
export const discriminatedUnion = (
  ...args: ZodDiscriminatedUnionArgs
): VDiscriminatedUnionSchema => {
  return z.discriminatedUnion(...args);
};

export type VDiscriminatedUnion = typeof discriminatedUnion;
