/* eslint-disable import-x/prefer-default-export */

import { useEffect, useState } from 'react';

/**
 * Hook that debounces a value
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @param disabled - If true, returns the value immediately without debouncing
 * @returns The debounced value
 */
export const useDebounce = <Value>(
  value: Value,
  delay: number,
  disabled = false,
) => {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(
    () => {
      // If disabled, update immediately
      if (disabled) {
        setDebouncedValue(value);
        return undefined;
      }

      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay, disabled], // Only re-call effect if value, delay, or disabled changes
  );

  return debouncedValue;
};
