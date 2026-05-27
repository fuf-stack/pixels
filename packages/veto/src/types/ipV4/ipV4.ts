import type { ZodIPv4 } from 'zod';

import { z } from 'zod';

/**
 * Creates a schema for IPv4 address strings (dotted-quad, e.g. `192.168.1.1`).
 *
 * @example
 * const schema = ipV4();
 * schema.parse('192.168.1.1');
 */
export const ipV4 = (): VIpV4Schema => {
  return z.ipv4();
};

export type VIpV4 = typeof ipV4;
export type VIpV4Schema = ZodIPv4;
