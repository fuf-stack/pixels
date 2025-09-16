// eslint-disable-next-line import/no-extraneous-dependencies
import { z } from 'zod';

export const { record } = z;

export type VRecord = typeof record;
