/* eslint-disable import-x/prefer-default-export */

/**
 * Creates a converter function that preserves the original type (string, number, or boolean)
 * of option values when converting from string keys back to their original type.
 *
 * This is useful for radio/select components where the underlying UI library
 * uses string keys internally, but we want to preserve number/boolean values in the form state.
 *
 * @param options - Array of options with a value property that can be string, number, or boolean
 * @returns An object with:
 *   - `convertToOriginalType`: Function to convert a string key back to its original type
 *   - `numberValueKeys`: Set of string representations of number values (for internal use)
 *   - `booleanValueKeys`: Map of string representations to boolean values (for internal use)
 */
export const createOptionValueConverter = <
  T extends { value: string | number | boolean },
>(
  options: T[],
) => {
  // Create a set of string keys that represent number values
  const numberValueKeys = new Set(
    options
      .filter((option) => {
        return typeof option.value === 'number';
      })
      .map((option) => {
        return String(option.value);
      }),
  );

  // Create a map of string keys to boolean values
  const booleanValueKeys = new Map(
    options
      .filter((option) => {
        return typeof option.value === 'boolean';
      })
      .map((option) => {
        return [String(option.value), option.value as boolean];
      }),
  );

  /**
   * Converts a string key back to its original type (string, number, or boolean)
   * based on whether the original option value was a number or boolean
   */
  const convertToOriginalType = (
    key: string | number | boolean,
  ): string | number | boolean => {
    const keyStr = String(key);
    const booleanValue = booleanValueKeys.get(keyStr);
    if (booleanValue !== undefined) {
      return booleanValue;
    }
    if (numberValueKeys.has(keyStr)) {
      return Number(keyStr);
    }
    return keyStr;
  };

  return {
    booleanValueKeys,
    convertToOriginalType,
    numberValueKeys,
  };
};
