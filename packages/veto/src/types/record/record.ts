import { z } from 'zod';

export const { record } = z;

export type VRecord = typeof record;
