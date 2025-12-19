import { z } from 'zod';

// In Zod v4, discriminatedUnion has a simpler signature
export const { discriminatedUnion } = z;

export type VDiscriminatedUnion = typeof discriminatedUnion;
