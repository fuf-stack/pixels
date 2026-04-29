import type { ZodNumber } from 'zod';

import { z } from 'zod';

export const number = (): VNumberSchema => {
  return z.number();
};

export type VNumber = typeof number;
export type VNumberSchema = ZodNumber;
