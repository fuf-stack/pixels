import type { VetoTypeAny } from 'src/types';
import type { ZodRecord, ZodType } from 'zod';

import { z } from 'zod';

/**
 * Creates a record schema with explicit key and value schemas (Zod v4 style).
 *
 * @example
 * const schema = record(z.string(), z.number());
 * schema.parse({ apples: 3, pears: 2 });
 *
 * @example
 * const schema = record(z.enum(['a', 'b']), z.string());
 * schema.parse({ a: 'x', b: 'y' });
 */
export const record = <
  TKey extends ZodType<PropertyKey>,
  TValue extends VetoTypeAny,
>(
  keySchema: TKey,
  valueSchema: TValue,
): VRecordSchema<TKey, TValue> => {
  return z.record(keySchema, valueSchema);
};

export type VRecord = typeof record;
export type VRecordSchema<
  TKey extends ZodType<PropertyKey>,
  TValue extends VetoTypeAny,
> = ZodRecord<TKey, TValue>;
