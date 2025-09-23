import type { vInfer } from '@fuf-stack/veto';

import { boolean, object, string } from '@fuf-stack/veto';

/** configuration of the filter */
export const config = object({
  /**
   * Human‑readable label used in the UI (e.g. in the chip and modal header).
   * Examples: "Magical", "Haunted"
   */
  text: string(),
  /**
   * Optional word shown before the label when building sentence‑like chips.
   * Examples: "is" → "is Magical"
   */
  textPrefix: string().optional(),
  /**
   * Optional negation word used when a boolean value is false.
   * Examples: "not" → "is not Magical"
   */
  textNoWord: string().optional(),
});

/** validate the filter value */
export const validate = (_config?: Config) => {
  return boolean().optional();
};

export type Config = vInfer<typeof config>;
export type Value = vInfer<ReturnType<typeof validate>>;
