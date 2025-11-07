/* eslint-disable import-x/prefer-default-export */

/**
 * Checks if the code is running in a test environment.
 *
 * This helper safely detects test environments by checking:
 * - Node.js: `process.env.NODE_ENV === 'test'` or `process.env.VITEST === 'true'`
 * - Browser: Always returns `false` (production code)
 *
 * The check is safe for both Node.js and browser environments by verifying
 * that `process` exists before accessing its properties.
 *
 * @returns `true` if running in a test environment, `false` otherwise
 *
 * @example
 * ```ts
 * if (isTestEnvironment()) {
 *   // Skip debouncing in tests for immediate snapshots
 *   return value;
 * }
 * // Normal production behavior with debouncing
 * return debouncedValue;
 * ```
 */
export const isTestEnvironment = (): boolean => {
  // Safe check: only access process if it exists (Node.js environment)
  // In browsers, process is undefined, so this returns false
  return (
    typeof process !== 'undefined' &&
    (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true')
  );
};
