/* eslint-disable import-x/prefer-default-export */

/**
 * Creates a converter function that preserves the original type (string or number)
 * of option values when converting from string keys back to their original type.
 *
 * This is useful for radio/select components where the underlying UI library
 * uses string keys internally, but we want to preserve number values in the form state.
 *
 * @param options - Array of options with a value property that can be string or number
 * @returns An object with:
 *   - `convertToOriginalType`: Function to convert a string key back to its original type
 *   - `numberValueKeys`: Set of string representations of number values (for internal use)
 */
export const createOptionValueConverter = <
  T extends { value: string | number },
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

  /**
   * Converts a string key back to its original type (string or number)
   * based on whether the original option value was a number
   */
  const convertToOriginalType = (key: string | number): string | number => {
    const keyStr = String(key);
    return numberValueKeys.has(keyStr) ? Number(keyStr) : keyStr;
  };

  return {
    convertToOriginalType,
    numberValueKeys,
  };
};
