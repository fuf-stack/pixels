/**
 * Recursively checks if any child field has an error (regardless of touched state).
 * Returns true if at least one child has an error.
 */
export const hasAnyChildErrors = (
  errors: Record<string, unknown> | undefined,
): boolean => {
  if (!errors) {
    return false;
  }

  return Object.keys(errors)
    .filter((key) => {
      return key !== '_errors';
    })
    .some((key) => {
      const errorValue = errors[key];
      if (errorValue === undefined) {
        return false;
      }
      // If errorValue is an array, it's a leaf field error
      if (Array.isArray(errorValue)) {
        return true;
      }
      // Recursively check nested objects
      if (typeof errorValue === 'object' && errorValue !== null) {
        return hasAnyChildErrors(errorValue as Record<string, unknown>);
      }
      return false;
    });
};

/**
 * Recursively checks if any child field is touched.
 * Returns true if at least one child is touched.
 */
export const hasAnyChildTouched = (
  touched: Record<string, unknown> | undefined,
): boolean => {
  if (!touched) {
    return false;
  }

  return Object.keys(touched)
    .filter((key) => {
      return key !== '_errors';
    })
    .some((key) => {
      const touchedValue = touched[key];
      if (touchedValue === undefined) {
        return false;
      }
      // If touchedValue is truthy (boolean true), field is touched
      if (touchedValue === true) {
        return true;
      }
      // Recursively check nested objects
      if (typeof touchedValue === 'object' && touchedValue !== null) {
        return hasAnyChildTouched(touchedValue as Record<string, unknown>);
      }
      return false;
    });
};

/**
 * Recursively checks if any child field with an error is also touched.
 * Returns true if at least one touched child has an error.
 */
export const hasVisibleChildErrors = (
  errors: Record<string, unknown> | undefined,
  touched: Record<string, unknown> | undefined,
): boolean => {
  if (!errors || !touched) {
    return false;
  }

  return Object.keys(errors)
    .filter((key) => {
      // Skip object-level errors (_errors) - those are handled separately
      return key !== '_errors';
    })
    .some((key) => {
      const errorValue = errors[key];
      const touchedValue = touched[key];

      // If this key doesn't exist in both errors and touched, skip
      if (errorValue === undefined || touchedValue === undefined) {
        return false;
      }

      // If errorValue is an array, it's a leaf field error
      if (Array.isArray(errorValue)) {
        // touchedValue being truthy means the field is touched
        return !!touchedValue;
      }

      // Recursively check nested objects
      if (typeof errorValue === 'object' && errorValue !== null) {
        return hasVisibleChildErrors(
          errorValue as Record<string, unknown>,
          touchedValue as Record<string, unknown>,
        );
      }

      return false;
    });
};

/** Reads nested child touched state for a dotted field path */
export const getNestedValue = (
  obj: Record<string, unknown> | undefined,
  path: string,
): Record<string, unknown> | undefined => {
  if (!obj) {
    return undefined;
  }
  const keys = path.split('.');
  let current: unknown = obj;
  keys.every((key) => {
    if (current && typeof current === 'object') {
      current = (current as Record<string, unknown>)[key];
      return true;
    }
    current = undefined;
    return false;
  });
  return current as Record<string, unknown> | undefined;
};
