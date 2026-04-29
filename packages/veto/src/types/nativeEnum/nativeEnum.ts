import { z } from 'zod';

/**
 * `z.nativeEnum` is deprecated in Zod v4.
 * Keep veto's API and delegate to `z.enum` which accepts enum-like inputs.
 *
 * @example
 * const schema = nativeEnum({ ONE: 'ONE', TWO: 'TWO' } as const);
 * schema.parse('ONE');
 */
type VNativeEnumValues = Record<string, string | number>;

export const nativeEnum = <T extends VNativeEnumValues>(
  values: T,
): ReturnType<typeof z.enum> => {
  return z.enum(values);
};

export type VNativeEnum = typeof nativeEnum;
export type VNativeEnumSchema = ReturnType<VNativeEnum>;
