/* eslint-disable @typescript-eslint/no-unsafe-return */

import type { vInfer } from '@fuf-stack/veto';

import { boolean, object, string } from '@fuf-stack/veto';

/** configuration of the filter */
export const config = object({
  /** TODO... */
  text: string(),
  /** TODO... */
  textPrefix: string().optional(),
  /** TODO... */
  textNoWord: string().optional(),
});

/** validate the filter value */
export const validate = (_config?: Config) => {
  return boolean().optional();
};

export type Config = vInfer<typeof config>;
export type Value = vInfer<ReturnType<typeof validate>>;
