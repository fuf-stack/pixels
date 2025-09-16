import type { ZodEnum } from 'zod';

// eslint-disable-next-line import/no-extraneous-dependencies
import { z } from 'zod';

export const vEnum = z.enum;

export type VEnum = typeof vEnum;
export type VEnumSchema<T extends [string, ...string[]]> = ZodEnum<T>;
