import type { VetoEffects } from 'src/types';

import { z } from 'zod';

export const { number } = z;

export type VNumber = typeof number;
export type VVNumberSchema = ReturnType<VNumber>;

/** when used with refine or superRefine */
export type VNumberRefined<Options = undefined> = (
  options?: Options,
) => VetoEffects<VVNumberSchema>;
