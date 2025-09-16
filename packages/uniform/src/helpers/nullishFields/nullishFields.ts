/**
 * String markers used to preserve null, false, and 0 values during JSON processing
 */
const nullString = '__NULL__';
const falseString = '__FALSE__';
const zeroString = '__ZERO__';

/**
 * Converts marker strings back to their original values when processing arrays
 */
export const fromNullishString = (value: unknown): unknown => {
  if (typeof value !== 'string') return value;

  switch (value) {
    case nullString:
      return null;
    case falseString:
      return false;
    case zeroString:
      return 0;
    default:
      return value;
  }
};

/**
 * Converts null/falsy values to marker strings for JSON processing
 */
export const toNullishString = (value: unknown): unknown => {
  if (value === null || value === '') return nullString;
  if (value === false) return falseString;
  if (value === 0) return zeroString;
  return value;
};

/**
 * Converts field values to a format suitable for forms by:
 * - Converting array values to their string markers to preserve null/falsy values
 * - Removing empty strings and null values from objects
 *
 * This conversion is required because React Hook Form does not support arrays with
 * flat values (string, number, boolean, null). Array fields must contain objects.
 * We work around this by converting array values to string markers.
 *
 * @example
 * const fields = {
 *   name: 'John',
 *   scores: [0, null, 75, false],
 *   contact: {
 *     email: '',
 *     phone: null,
 *     address: '123 Main St'
 *   }
 * };
 *
 * // Result:
 * {
 *   name: 'John',
 *   scores: ['__ZERO__', '__NULL__', 75, '__FALSE__'],
 *   contact: {
 *     address: '123 Main St'
 *   }
 * }
 */
export const toFormFormat = (
  fields: Record<string, unknown>,
): Record<string, unknown> => {
  return JSON.parse(
    JSON.stringify(fields, (_, value) => {
      if (Array.isArray(value)) {
        return value.map(toNullishString);
      }

      if (value && typeof value === 'object') {
        return Object.fromEntries(
          Object.entries(value).filter(([_key, v]) => {
            return v !== '' && v !== null;
          }),
        );
      }

      return value;
    }),
  );
};

/**
 * Converts form state to a format suitable for validation by:
 * - Converting array string markers (__NULL__, __FALSE__, __ZERO__) back to their original values
 * - Converting _NULL__ to null
 * - Removing fields that contain empty strings, null, or any string markers representing null/empty values
 *
 * @example
 * const formState = {
 *   name: 'John',
 *   scores: [75, '__ZERO__', '_NULL__', '__FALSE__'],
 *   email: null,
 *   phone: '__NULL__',
 *   contact: {
 *     address: '123 Main St',
 *     fax: null
 *   }
 * };
 *
 * // Result:
 * {
 *   name: 'John',
 *   scores: [75, 0, null, false],
 *   contact: {
 *     address: '123 Main St'
 *   }
 * }
 */
export const toValidationFormat = (
  formState: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null | undefined => {
  // Handle null or undefined input
  if (formState === undefined || formState === null) {
    return formState;
  }

  return JSON.parse(
    JSON.stringify(formState, (_, value) => {
      if (Array.isArray(value)) {
        return value.map(fromNullishString);
      }

      if (value && typeof value === 'object') {
        return Object.fromEntries(
          Object.entries(value)
            .filter(([_key, v]) => {
              return (
                fromNullishString(v) !== '' && fromNullishString(v) !== null
              );
            })
            .map(([k, v]) => {
              return [k, fromNullishString(v)];
            }),
        );
      }

      return value;
    }),
  );
};
