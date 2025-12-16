import type { ZodTypeAny } from 'zod';

import { z } from 'zod';

/**
 * Creates a record schema with string keys and the specified value type.
 * In Zod v4, z.record requires explicit key and value types.
 * This wrapper maintains backwards compatibility with v3's single-argument API.
 *
 * @param valueType - The Zod schema for record values
 * @returns A record schema with string keys
 *
 * @example
 * ```ts
 * const schema = record(string());
 * // Creates Record<string, string>
 * ```
 */
export const record = <T extends ZodTypeAny>(valueType: T) => {
  return z.record(z.string(), valueType);
};

export type VRecord = typeof record;
