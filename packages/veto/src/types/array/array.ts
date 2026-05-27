import type { VetoTypeAny } from 'src/types';
import type { ZodArray } from 'zod';

import { z } from 'zod';

/**
 * Creates an array schema from an element schema.
 *
 * @example
 * const schema = array(string()).min(1);
 * schema.parse(['value']);
 */
export const array: <T extends VetoTypeAny>(schema: T) => VArraySchema<T> =
  z.array;

export type VArray = typeof array;
export type VArraySchema<T extends VetoTypeAny> = ZodArray<T>;
