import { z } from 'zod';

type VEnumValues = readonly [string, ...string[]];

/**
 * Creates a string enum schema from literal values.
 *
 * @example
 * const schema = vEnum(['ONE', 'TWO'] as const);
 * schema.parse('ONE');
 */
export const vEnum = <T extends VEnumValues>(values: T) => {
  return z.enum(values);
};

export type VEnum = typeof vEnum;
export type VEnumSchema = ReturnType<VEnum>;
