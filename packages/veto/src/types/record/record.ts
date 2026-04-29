import type { VetoTypeAny } from 'src/types';
import type { ZodRecord } from 'zod';

import { z } from 'zod';

/**
 * Keeps the veto v0 API where `record(valueSchema)` defaults to string keys.
 * Zod v4 dropped the single-argument overload, so we normalize it here.
 *
 * @example
 * const schema = record(z.number());
 * schema.parse({ apples: 3, pears: 2 });
 */
export const record = <T extends VetoTypeAny>(
  valueSchema: T,
): VRecordSchema => {
  return z.record(z.string(), valueSchema);
};

export type VRecord = typeof record;
export type VRecordSchema = ZodRecord;
