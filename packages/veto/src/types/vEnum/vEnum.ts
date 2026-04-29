import { z } from 'zod';

type VEnumValues = readonly [string, ...string[]];

export const vEnum = <T extends VEnumValues>(values: T) => {
  return z.enum(values);
};

export type VEnum = typeof vEnum;
export type VEnumSchema = ReturnType<VEnum>;
