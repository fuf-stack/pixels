// eslint-disable-next-line import/no-extraneous-dependencies
import { z } from 'zod';

export const { nativeEnum } = z;

export type VNativeEnum = typeof nativeEnum;
