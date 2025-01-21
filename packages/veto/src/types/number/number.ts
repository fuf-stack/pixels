import type { VetoEffects } from 'src/types';

// eslint-disable-next-line import/no-extraneous-dependencies
import { z } from 'zod';

// eslint-disable-next-line prefer-destructuring
export const number = z.number;

export type VNumber = typeof number;
export type VVNumberSchema = ReturnType<VNumber>;

/** when used with refine or superRefine */
export type VNumberRefined<Options = undefined> = (
  options?: Options,
) => VetoEffects<VVNumberSchema>;
