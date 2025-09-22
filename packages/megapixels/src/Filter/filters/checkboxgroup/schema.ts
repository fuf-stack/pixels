import type { vInfer } from '@fuf-stack/veto';

import { array, object, refineArray, string } from '@fuf-stack/veto';

/** configuration of the filter */
export const config = object({
  /** TODO... */
  text: string(),
  /** options... */
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
