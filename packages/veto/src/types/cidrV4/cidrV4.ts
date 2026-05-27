import type { ZodCIDRv4 } from 'zod';

import { z } from 'zod';

/**
 * Creates a schema for IPv4 CIDR notation strings (e.g. `192.168.1.0/24`).
 *
 * @example
 * const schema = cidrV4();
 * schema.parse('192.168.1.0/24');
 */
export const cidrV4 = (): VCidrV4Schema => {
  return z.cidrv4();
};

export type VCidrV4 = typeof cidrV4;
export type VCidrV4Schema = ZodCIDRv4;
