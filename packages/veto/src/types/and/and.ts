import { z } from 'zod';

// TODO: make it accept a list
export const and: typeof z.intersection = (...args) => {
  return z.intersection(...args);
};

export type VAnd = typeof and;
