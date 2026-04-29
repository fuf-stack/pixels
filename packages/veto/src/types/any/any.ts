import type { ZodAny } from 'zod';

import { z } from 'zod';

/**
 * Creates a schema that accepts any value.
 *
 * @example
 * const schema = any();
 * schema.parse({ anything: true });
 */
export const any = (): VAnySchema => {
  return z.any();
};

export type VAny = typeof any;
export type VAnySchema = ZodAny;
