import type { ZodDiscriminatedUnionOption } from 'zod';

// eslint-disable-next-line import/no-extraneous-dependencies
import { z } from 'zod';

export const discriminatedUnion: <
  Discriminator extends string,
  Types extends [
    ZodDiscriminatedUnionOption<Discriminator>,
    ...ZodDiscriminatedUnionOption<Discriminator>[],
  ],
>(
  discriminator: Discriminator,
  options: Types,
) => z.ZodDiscriminatedUnion<Discriminator, Types> = z.discriminatedUnion;

export type VDiscriminatedUnion = typeof discriminatedUnion;
