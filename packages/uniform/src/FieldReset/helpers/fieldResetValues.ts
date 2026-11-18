import {
  toFormFormat,
  toSubmitFormat,
} from '../../helpers/nullishFields/nullishFields';

/** Controls when a FieldReset field is included in the submitted data */
export type FieldResetInclude = 'always' | 'changed';

// wrap a single value so the object-based format helpers can process it
const WRAPPER_KEY = 'value';

/**
 * Converts an original value to the format React Hook Form stores, so it can
 * be written to the form. Empty values (null, '', []) become `null`.
 */
export const toFormFieldValue = (original: unknown): unknown => {
  const formValue = toFormFormat({ [WRAPPER_KEY]: original })[WRAPPER_KEY];
  return formValue === undefined ? null : formValue;
};

/**
 * Normalizes a value stored in the form to the format used for submission,
 * which removes empty values and unwraps flat array entries.
 */
const normalizeFormValue = (formValue: unknown): unknown => {
  return toSubmitFormat({ [WRAPPER_KEY]: formValue })?.[WRAPPER_KEY];
};

/**
 * Compares two normalized values. Primitives are compared by their string
 * representation because inputs such as NumberInput store `'8'` for `8`.
 */
const isEquivalent = (a: unknown, b: unknown): boolean => {
  if (a === b) {
    return true;
  }
  if (a === undefined || a === null || b === undefined || b === null) {
    return false;
  }
  // match numeric input spellings to numeric baselines without treating blanks
  // as zero or converting string-valued baselines
  if (typeof b === 'number' && typeof a === 'string' && a.trim() !== '') {
    return Number(a) === b;
  }
  if (typeof a !== 'object' && typeof b !== 'object') {
    return String(a) === String(b);
  }
  if (typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    return (
      Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((entry, index) => {
        return isEquivalent(entry, b[index]);
      })
    );
  }
  const recordA = a as Record<string, unknown>;
  const recordB = b as Record<string, unknown>;
  const keys = new Set([...Object.keys(recordA), ...Object.keys(recordB)]);
  return [...keys].every((key) => {
    return isEquivalent(recordA[key], recordB[key]);
  });
};

/**
 * Checks whether a value stored in the form differs from an original value.
 *
 * Both values are normalized first, so empty values (undefined, null, '', [])
 * are equal and a stored `'8'` equals an original `8`.
 *
 * @param formValue - The raw value stored in React Hook Form
 * @param original - The original value passed to FieldReset
 * @returns true if the field value differs from the original value
 */
export const isFieldValueChanged = (
  formValue: unknown,
  original: unknown,
): boolean => {
  return !isEquivalent(
    normalizeFormValue(formValue),
    normalizeFormValue(toFormFieldValue(original)),
  );
};

/**
 * Checks whether two original values are equivalent, so a re-rendered parent
 * that creates a new array or object does not count as a new original value.
 */
export const isOriginalEqual = (a: unknown, b: unknown): boolean => {
  return !isFieldValueChanged(toFormFieldValue(a), b);
};
