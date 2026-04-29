import { z } from 'zod';

// TODO: make it accept a list
/**
 * Creates an intersection schema from two schemas.
 *
 * @example
 * const schema = and(z.object({ a: z.string() }), z.object({ b: z.number() }));
 * schema.parse({ a: 'x', b: 1 });
 */
export const and: typeof z.intersection = (...args) => {
  return z.intersection(...args);
};

export type VAnd = typeof and;
