import type { ZodAny } from 'zod';

import { z } from 'zod';

export const any = (): VAnySchema => {
  return z.any();
};

export type VAny = typeof any;
export type VAnySchema = ZodAny;
