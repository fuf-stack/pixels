import type { Input, Output, VetoTypeAny } from 'src/types';
import type { ZodType } from 'zod';

import { z } from 'zod';

interface VDiscriminatedUnionOptions {
  error?: string | { message: string };
  inclusive?: boolean;
  message?: string;
  unionFallback?: boolean;
}

type VDiscriminatedUnionMembers = readonly [VetoTypeAny, ...VetoTypeAny[]];

export type VDiscriminatedUnionSchema<
  TOptions extends VDiscriminatedUnionMembers = VDiscriminatedUnionMembers,
> = ZodType<Output<TOptions[number]>, Input<TOptions[number]>>;

/**
 * Creates a discriminated union schema.
 *
 * @example
 * const schema = discriminatedUnion('type', [
 *   object({ type: literal('a'), value: string() }),
 *   object({ type: literal('b'), count: number() }),
 * ]);
 */
export const discriminatedUnion = <TOptions extends VDiscriminatedUnionMembers>(
  discriminator: string,
  options: TOptions,
  params?: string | VDiscriminatedUnionOptions,
): VDiscriminatedUnionSchema<TOptions> => {
  return z.discriminatedUnion(
    discriminator,
    options as Parameters<typeof z.discriminatedUnion>[1],
    params as Parameters<typeof z.discriminatedUnion>[2],
  ) as VDiscriminatedUnionSchema<TOptions>;
};

export type VDiscriminatedUnion = typeof discriminatedUnion;
