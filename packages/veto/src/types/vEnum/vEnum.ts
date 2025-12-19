import { z } from 'zod';

export const vEnum = z.enum;

export type VEnum = typeof vEnum;
// VEnumSchema type removed - use ReturnType<typeof vEnum<T>> directly if needed
