import type { ZodCIDRv6 } from 'zod';

import { z } from 'zod';

/**
 * Creates a schema for IPv6 CIDR notation strings (e.g. `2001:db8::/32`).
 *
 * @example
 * const schema = cidrV6();
 * schema.parse('2001:db8::/32');
 */
export const cidrV6 = (): VCidrV6Schema => {
  return z.cidrv6();
};

export type VCidrV6 = typeof cidrV6;
export type VCidrV6Schema = ZodCIDRv6;
