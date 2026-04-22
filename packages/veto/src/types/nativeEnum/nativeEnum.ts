import { z } from 'zod';

/**
 * `z.nativeEnum` is deprecated in Zod v4.
 * Keep veto's API and delegate to `z.enum` which accepts enum-like inputs.
 */
export const nativeEnum = <T extends Record<string, string | number>>(
  values: T,
) => {
  return z.enum(values);
};

export type VNativeEnum = typeof nativeEnum;
