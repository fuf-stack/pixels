/* eslint-disable import-x/prefer-default-export */

import { useEffect, useRef, useState } from 'react';

import { isTestEnvironment } from '@fuf-stack/pixel-utils';

/**
 * Hook that debounces a value
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @returns The debounced value
 */
export const useDebounce = <Value>(value: Value, delay: number) => {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);
  // Track if component is mounted to prevent setState on unmounted component
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Mark as mounted
    isMountedRef.current = true;
    return () => {
      // Mark as unmounted on cleanup
      isMountedRef.current = false;
    };
  }, []);

  useEffect(
    () => {
      // In test environments, skip debouncing for immediate snapshots
      if (isTestEnvironment()) {
        setDebouncedValue(value);
        return;
      }

      // Update debounced value after delay
      const handler = setTimeout(() => {
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setDebouncedValue(value);
        }
      }, delay);

      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      // eslint-disable-next-line consistent-return
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay], // Only re-call effect if value or delay changes
  );

  return debouncedValue;
};
