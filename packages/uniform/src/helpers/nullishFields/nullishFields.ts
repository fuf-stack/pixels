import { slugify } from '@fuf-stack/pixel-utils';

/** Key used to wrap flat array elements when converting to form format */
export const flatArrayKey = '__FLAT__';

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
  // Support arrays: unwrap flat wrappers and convert marker strings per entry
  if (Array.isArray(value)) {
    return (value as unknown[]).map((entry) => {
      if (entry && typeof entry === 'object') {
        const record = entry as Record<string, unknown>;
        if (flatArrayKey in record) {
          const inner = record[flatArrayKey];
          // For arrays, treat empty string as null (placeholder input)
          if (inner === '') {
            return null;
          }
          return fromNullishString(inner);
        }
      }
      return fromNullishString(entry);
    });
  }

  if (typeof value !== 'string') {
    return value;
  }

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
  if (Array.isArray(value)) {
    // Only wrap arrays of primitives; leave arrays of objects as-is
    const isPrimitive = (v: unknown) => {
      return v === null || ['string', 'number', 'boolean'].includes(typeof v);
    };
    const isPrimitiveArray = (value as unknown[]).every(isPrimitive);
    if (isPrimitiveArray) {
      return (value as unknown[]).map((v) => {
        // Store raw primitive; do not convert to marker strings inside the wrapper
        return { [flatArrayKey]: v } as Record<string, unknown>;
      });
    }
    return value;
  }
  if (value === null || value === '') {
    return nullString;
  }
  if (value === false) {
    return falseString;
  }
  if (value === 0) {
    return zeroString;
  }
  return value;
};

/**
 * Converts field values to a format suitable for forms by:
 * - Wrapping arrays of primitives as objects using the flatArrayKey `__FLAT__`
 *   to satisfy RHF's requirement that array fields contain objects
 * - Removing empty strings and null values from objects
 *
 * This conversion is required because React Hook Form does not support arrays with
 * flat values (string, number, boolean, null). Array fields must contain objects.
 * We work around this by wrapping primitive entries: `{ __FLAT__: <value> }`.
 *
 * @example
 * const fields = {
 *   name: 'John',
 *   scores: [0, null, 75, false],
 *   scoresDetailed: [
 *     { score: 1 },
 *     { score: null },
 *     { score: 0 },
 *     { score: false },
 *     { score: '' },
 *   ],
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
 *   scores: [
 *     { __FLAT__: 0 },
 *     { __FLAT__: null },
 *     { __FLAT__: 75 },
 *     { __FLAT__: false }
 *   ],
 *   // Arrays of objects are left as objects; empty/null properties are removed
 *   scoresDetailed: [
 *     { score: 1 },
 *     {}, // null score removed
 *     { score: 0 },
 *     { score: false },
 *     {}, // empty string removed
 *   ],
 *   contact: {
 *     address: '123 Main St'
 *   }
 * }
 */
export const toFormFormat = (fields: Record<string, unknown>) => {
  const formFormatJson = JSON.stringify(fields, (_, value) => {
    if (Array.isArray(value)) {
      // Delegate to toNullishString to ensure consistent handling
      return toNullishString(value);
    }

    if (value && typeof value === 'object') {
      // Preserve flat-array wrappers as-is (do not filter their inner values here)
      const record = value as Record<string, unknown>;
      if (flatArrayKey in record) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return value;
      }
      return Object.fromEntries(
        Object.entries(value).filter(([_key, v]) => {
          return v !== '' && v !== null;
        }),
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value;
  });

  return JSON.parse(formFormatJson) as Record<string, unknown>;
};

/**
 * Converts form state to a format suitable for validation by:
 * - Unwrapping flat array wrappers `{ __FLAT__: <value> }` back to primitives
 * - Converting legacy string markers (__NULL__, __FALSE__, __ZERO__) back to their original values
 * - Removing fields whose converted value is empty string or null
 * - Removing empty arrays
 *
 * @example
 * const formState = {
 *   name: 'John',
 *   scores: [
 *     { __FLAT__: 75 },
 *     { __FLAT__: 0 },
 *     { __FLAT__: null },
 *     { __FLAT__: false }
 *   ],
 *   emptyArray: [],
 *   scoresDetailed: [
 *     { score: 1 },
 *     {},
 *     { score: 0 },
 *     { score: false },
 *     {},
 *   ],
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
 *   // emptyArray is removed
 *   // Objects inside arrays remain objects; empty entries remain empty objects
 *   scoresDetailed: [
 *     { score: 1 },
 *     {},
 *     { score: 0 },
 *     { score: false },
 *     {},
 *   ],
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

  const validationFormatJson = JSON.stringify(formState, (_, value) => {
    if (Array.isArray(value)) {
      return value.map((v) => {
        // Unwrap new wrapper format { __FLAT__: <value> }
        if (v && typeof v === 'object') {
          const record = v as Record<string, unknown>;
          if (flatArrayKey in record) {
            const inner = record[flatArrayKey];
            // Treat empty string from forms as null in validation format
            if (inner === '') {
              return null;
            }
            return fromNullishString(inner);
          }
        }
        // Backward compatibility for string markers
        return fromNullishString(v);
      });
    }

    if (value && typeof value === 'object') {
      // Object branch: remove keys that resolve to empty/null after marker conversion
      // and unwrap flat-array wrappers if present.
      //
      // Why this shape?
      // - Forms may contain objects with placeholder/empty values that should not
      //   be part of the validation payload (e.g. "" or __NULL__ markers).
      // - Arrays of primitives are stored as wrapper objects { __FLAT__: <value> }
      //   to satisfy RHF structure constraints. When converting back for
      //   validation, we need to treat wrappers whose inner value resolves to
      //   empty/null as removable, and unwrap non-empty wrappers to the primitive.
      return Object.fromEntries(
        Object.entries(value)
          .filter(([_key, v]) => {
            // If this is a flat-array wrapper, convert the inner value first and
            // drop the key when the inner resolves to empty string or null.
            if (v && typeof v === 'object') {
              const record = v as Record<string, unknown>;
              if (flatArrayKey in record) {
                const convertedInner = fromNullishString(record[flatArrayKey]);
                return convertedInner !== '' && convertedInner !== null;
              }
            }
            // Drop empty arrays
            if (Array.isArray(v) && v.length === 0) {
              return false;
            }
            // For regular values, convert markers and drop when empty/null.
            const converted = fromNullishString(v);
            return converted !== '' && converted !== null;
          })
          .map(([k, v]) => {
            // Unwrap flat-array wrappers to raw primitives after conversion.
            if (v && typeof v === 'object') {
              const record = v as Record<string, unknown>;
              if (flatArrayKey in record) {
                return [k, fromNullishString(record[flatArrayKey])];
              }
            }
            // For other values, just convert markers.
            return [k, fromNullishString(v)];
          }),
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value;
  });

  return JSON.parse(validationFormatJson) as Record<string, unknown>;
};

/**
 * Converts a field name to a testId by removing flat array key segments and slugifying.
 * Removes all occurrences of `flatArrayKey` from the field name and applies slugify transformation.
 *
 * This is used to generate stable testIds for form fields that don't include
 * the internal `__FLAT__` marker used for flat arrays.
 *
 * @param name - The field name as a string (e.g., 'tags.0.__FLAT__') or array path (e.g., ['tags', '0', '__FLAT__'])
 * @returns The slugified field name with all flat array key segments removed (e.g., 'tags_0')
 *
 * @example
 * ```ts
 * nameToTestId('tags.0.__FLAT__') // => 'tags_0'
 * nameToTestId('array.0.__FLAT__') // => 'array_0'
 * nameToTestId('nested.array.0.__FLAT__.field') // => 'nested_array_0_field'
 * nameToTestId('simple.field') // => 'simple_field'
 * nameToTestId(['tags', '0', '__FLAT__']) // => 'tags_0'
 * ```
 */
export const nameToTestId = (name: string | readonly string[]): string => {
  let cleanName: string;

  // Handle array paths - filter out flatArrayKey and join with dots
  if (Array.isArray(name)) {
    cleanName = name
      .filter((segment: string) => {
        return segment !== flatArrayKey;
      })
      .join('.');
  } else {
    // Handle string paths - split by dots and filter out flatArrayKey segments
    const segments = (name as string).split('.');
    cleanName = segments
      .filter((segment: string) => {
        return segment !== flatArrayKey;
      })
      .join('.');
  }

  // Apply slugify transformation
  return slugify(cleanName, { replaceDots: true });
};
