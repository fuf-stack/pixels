import type { Input, Output, VetoTypeAny } from 'src/types';
import type { ZodType } from 'zod';

import { z } from 'zod';

export interface VDiscriminatedUnionOptions {
  error?: string | { message: string };
  inclusive?: boolean;
  message?: string;
  unionFallback?: boolean;
}

type VDiscriminatedUnionMembers = readonly [VetoTypeAny, ...VetoTypeAny[]];

export type VDiscriminatedUnionSchema<
  TDiscriminator extends string = string,
  TOptions extends VDiscriminatedUnionMembers = VDiscriminatedUnionMembers,
> = ZodType<Output<TOptions[number]>, Input<TOptions[number]>> & {
  /** Type-only marker used by helpers that need to preserve the discriminator. */
  readonly _vetoDiscriminator: TDiscriminator;
};

/**
 * Creates a discriminated union schema.
 *
 * @example
 * const schema = discriminatedUnion('type', [
 *   object({ type: literal('a'), value: string() }),
 *   object({ type: literal('b'), count: number() }),
 * ]);
 */
export const discriminatedUnion = <
  TDiscriminator extends string,
  TOptions extends VDiscriminatedUnionMembers,
>(
  discriminator: TDiscriminator,
  options: TOptions,
  params?: string | VDiscriminatedUnionOptions,
): VDiscriminatedUnionSchema<TDiscriminator, TOptions> => {
  return z.discriminatedUnion(
    discriminator,
    options as Parameters<typeof z.discriminatedUnion>[1],
    params as Parameters<typeof z.discriminatedUnion>[2],
  ) as VDiscriminatedUnionSchema<TDiscriminator, TOptions>;
};

export type VDiscriminatedUnion = typeof discriminatedUnion;
