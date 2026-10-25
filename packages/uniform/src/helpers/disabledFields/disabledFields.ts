import type { FieldValues } from 'react-hook-form';

import { flatArrayKey } from '../nullishFields/nullishFields';

/** Removes one path by copying only its ancestors, leaving stored values and array indices intact. */
const omitPath = (
  value: unknown,
  [key, ...rest]: readonly string[],
): unknown => {
  if (
    !value ||
    typeof value !== 'object' ||
    key === undefined ||
    !Object.getOwnPropertyDescriptor(value, key)
  ) {
    return value;
  }

  // Preserve holes left by previously omitted array entries.
  const copy = (Array.isArray(value) ? value.slice() : { ...value }) as Record<
    string,
    unknown
  >;

  if (rest.length) {
    copy[key] = omitPath(copy[key], rest);
  } else {
    // Delete rather than splice so later array fields keep their indices.
    delete copy[key];
  }

  return copy;
};

/** Omits disabled fields from normalized validation/submission data without changing form state. */
const omitDisabledValues = (
  values: FieldValues,
  names: readonly string[],
): FieldValues => {
  return names.reduce((data, name) => {
    // Match RHF names to normalized data, where flat-array wrappers are gone.
    const path = name
      .replace(/\[(\d+)\]/g, '.$1')
      .split('.')
      .filter((part) => {
        return part !== flatArrayKey;
      });

    return omitPath(data, path) as FieldValues;
  }, values);
};

export default omitDisabledValues;
