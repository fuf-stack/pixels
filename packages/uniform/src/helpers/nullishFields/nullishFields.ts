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
 * Checks if a value is considered "empty" for validation display purposes.
 *
 * Used by useUniformField to determine when to show validation errors.
 * Empty values don't trigger immediate error display (user must interact first).
 *
 * Handles:
 * - Primitives: null, undefined, ''
 * - Marker strings: __NULL__, __FALSE__, __ZERO__ (converted via fromNullishString)
 * - Empty arrays: []
 * - Objects with all empty values: {a: null, b: ''}
 * - Flat array wrappers: {__FLAT__: null} or {__FLAT__: ''}
 *
 * @param value - The value to check (will be converted via fromNullishString first)
 * @returns true if the value is empty
 *
 * @example
 * isValueEmpty(null)                    // true
 * isValueEmpty('')                      // true
 * isValueEmpty('__NULL__')              // true (marker string)
 * isValueEmpty([])                      // true (empty array)
 * isValueEmpty({a: null})               // true (object with all empty values)
 * isValueEmpty({__FLAT__: null})        // true (flat array wrapper with empty value)
 * isValueEmpty({__FLAT__: ''})          // true
 * isValueEmpty('hello')                 // false
 * isValueEmpty([1, 2])                  // false
 * isValueEmpty({a: 'value'})            // false
 * isValueEmpty({__FLAT__: 'value'})     // false
 */
export const isValueEmpty = (value: unknown): boolean => {
  // Convert marker strings first
  const converted = fromNullishString(value);

  if (converted === undefined || converted === null || converted === '') {
    return true;
  }
  if (Array.isArray(converted)) {
    return converted.length === 0;
  }
  if (typeof converted === 'object' && converted !== null) {
    const record = converted as Record<string, unknown>;
    // Handle flat array wrapper: { __FLAT__: innerValue }
    if (flatArrayKey in record) {
      return isValueEmpty(record[flatArrayKey]);
    }
    // For objects (e.g., FieldCard), check if all values are null/undefined/empty
    const values = Object.values(record);
    return values.length === 0 || values.every(isValueEmpty);
  }
  return false;
};

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
 * Helper function to check if a value is an empty object (not an array).
 */
const isEmptyObject = (value: unknown): boolean => {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.keys(value as Record<string, unknown>).length === 0
  );
};

/**
 * Recursively removes empty objects from a data structure.
 * - Filters empty objects from arrays
 * - Removes properties with empty object values
 * - Removes arrays that become empty after filtering
 */
const removeEmptyObjects = (obj: unknown): unknown => {
  if (Array.isArray(obj)) {
    // Filter out empty objects from arrays, then recursively process remaining items
    return obj
      .filter((item) => {
        return !isEmptyObject(item);
      })
      .map((item) => {
        return removeEmptyObjects(item);
      });
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .map(([key, value]) => {
          return [key, removeEmptyObjects(value)] as [string, unknown];
        })
        .filter(([_, processed]) => {
          // Skip empty objects
          if (isEmptyObject(processed)) {
            return false;
          }
          // Skip arrays that are now empty after filtering
          if (Array.isArray(processed) && processed.length === 0) {
            return false;
          }
          return true;
        }),
    );
  }

  return obj;
};

/**
 * Converts form state to a format suitable for submission by:
 * - Applying all transformations from toValidationFormat
 * - Additionally removing empty objects from the result
 * - Filtering empty objects from arrays
 * - Recursively cleaning nested structures
 *
 * **Why separate from toValidationFormat?**
 *
 * Empty objects must be preserved during validation so that custom refinements
 * can run. For example, a FieldCard with "at least email or phone required"
 * validation needs the object to exist (even if empty) for the refine to execute.
 *
 * However, for submission, empty objects are meaningless and should be removed
 * to produce clean data for APIs.
 *
 * @example
 * const formState = {
 *   name: 'John',
 *   contact: {},           // Empty FieldCard - will be removed
 *   tags: [{}, {}, {}],    // All empty - array will be removed
 *   items: [
 *     { value: 'a' },
 *     {},                  // Empty entry - will be filtered out
 *     { value: 'b' }
 *   ],
 *   nested: {
 *     deep: {}             // Nested empty - will be removed recursively
 *   }
 * };
 *
 * // Result:
 * {
 *   name: 'John',
 *   items: [{ value: 'a' }, { value: 'b' }]
 * }
 */
export const toSubmitFormat = (
  formState: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null | undefined => {
  const validated = toValidationFormat(formState);
  if (!validated) {
    return validated;
  }
  return removeEmptyObjects(validated) as Record<string, unknown>;
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
