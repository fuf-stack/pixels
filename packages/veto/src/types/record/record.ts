import type { VetoTypeAny } from 'src/types';

import { z } from 'zod';

/**
 * Keeps the veto v0 API where `record(valueSchema)` defaults to string keys.
 * Zod v4 dropped the single-argument overload, so we normalize it here.
 */
export const record = <T extends VetoTypeAny>(valueSchema: T) => {
  return z.record(z.string(), valueSchema);
};

export type VRecord = typeof record;
