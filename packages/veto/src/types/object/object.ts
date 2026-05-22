import type { VetoRawShape } from 'src/types';
import type { ZodObject } from 'zod';

import { z } from 'zod';

/**
 * Creates a strict object schema.
 *
 * Unknown keys are rejected.
 *
 * @example
 * const schema = object({ name: z.string() });
 * schema.parse({ name: 'Ada' });
 *
 * @see https://zod.dev/?id=strict
 */
export const object = <T extends VetoRawShape>(schema: T): VObjectSchema<T> => {
  // expect objects to be strict (disallow unknown keys)
  return z.strictObject(schema);
};

export type VObject = typeof object;
export type VObjectSchema<T extends VetoRawShape> = ZodObject<T>;

/**
 * Creates a non-strict object schema.
 *
 * Unknown keys are allowed.
 *
 * @example
 * const schema = objectLoose({ name: z.string() });
 * schema.parse({ name: 'Ada', extra: true });
 *
 * @see https://zod.dev/?id=objects
 */
export const objectLoose = <T extends VetoRawShape>(
  schema: T,
): VObjectLooseSchema<T> => {
  return z.object(schema);
};

export type VObjectLoose = typeof objectLoose;
export type VObjectLooseSchema<T extends VetoRawShape> = ZodObject<T>;
