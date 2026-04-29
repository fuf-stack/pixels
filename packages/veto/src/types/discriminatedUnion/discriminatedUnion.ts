import { z } from 'zod';

type ZodDiscriminatedUnionFactory = typeof z.discriminatedUnion;
type ZodDiscriminatedUnionArgs = Parameters<ZodDiscriminatedUnionFactory>;

export type VDiscriminatedUnionSchema =
  ReturnType<ZodDiscriminatedUnionFactory>;

export const discriminatedUnion = (
  ...args: ZodDiscriminatedUnionArgs
): VDiscriminatedUnionSchema => {
  return z.discriminatedUnion(...args);
};

export type VDiscriminatedUnion = typeof discriminatedUnion;
