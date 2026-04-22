import { z } from 'zod';

const { discriminatedUnion } = z;
export { discriminatedUnion };

export type VDiscriminatedUnion = typeof discriminatedUnion;
