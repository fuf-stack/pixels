import type { ZodBoolean } from 'zod';

import { z } from 'zod';

export const boolean = (): VBooleanSchema => {
  return z.boolean();
};

export type VBoolean = typeof boolean;
export type VBooleanSchema = ZodBoolean;
