import type { ZodIPv6 } from 'zod';

import { z } from 'zod';

/**
 * Creates a schema for IPv6 address strings (e.g. `::1`, `2001:db8::1`).
 *
 * @example
 * const schema = ipV6();
 * schema.parse('2001:db8::1');
 */
export const ipV6 = (): VIpV6Schema => {
  return z.ipv6();
};

export type VIpV6 = typeof ipV6;
export type VIpV6Schema = ZodIPv6;
