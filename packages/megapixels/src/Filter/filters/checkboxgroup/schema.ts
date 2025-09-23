import type { vInfer } from '@fuf-stack/veto';

import { array, object, refineArray, string } from '@fuf-stack/veto';

/** configuration of the filter */
export const config = object({
  /**
   * Human‑readable label used in the UI (e.g. label and modal header).
   * Example: "Snacks", "Mood"
   */
  text: string(),
  /**
   * Options rendered as multiple checkboxes. Each option needs a `label`
   * (what the user sees) and a `value` (what is written into the form state).
   */
  options: array(object({ label: string(), value: string() })),
});

/** validate the filter value */
export const validate = (cfg?: Config) => {
  return refineArray(array(string()).optional())({
    unique: true,
    custom: (values, ctx) => {
      if (!cfg) {
        return;
      }
      values.forEach((value) => {
        if (
          !cfg.options.find((option) => {
            return option?.value === value;
          })
        ) {
          ctx.addIssue({
            code: 'custom',
            message: `Invalid value: ${value}`,
          });
        }
      });
    },
  });
};

export type Config = vInfer<typeof config>;
export type Value = vInfer<ReturnType<typeof validate>>;
