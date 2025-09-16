// eslint-disable-next-line import/no-extraneous-dependencies
import { z } from 'zod';

export const { literal } = z;

export type VLiteral = typeof literal;
