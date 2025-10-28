import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseInputValueDebounceOptions<TValue = unknown> {
  /** Debounce delay in milliseconds (default: 300) */
  debounceDelay?: number;
  /** The onBlur function to call after flushing debounced value */
  onBlur: () => void;
  /** The onChange function to call with debounced value */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (...event: any[]) => void;
  /** The field value */
  value: TValue;
}

export interface UseInputValueDebounceReturn<TValue = unknown> {
  /** Enhanced onChange function with debouncing */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (...event: any[]) => void;
  /** Enhanced onBlur function that flushes current value immediately */
  onBlur: () => void;
  /** The field value that is displayed - updates immediately */
  value: TValue;
}

/**
 * Custom hook for debouncing value changes with immediate blur support.
 *
 * Provides immediate visual feedback by updating the value instantly,
 * while debouncing the actual onChange calls. When focus is lost,
 * any pending debounced changes are immediately flushed.
 *
 * **Key Features:**
 * - **Debouncing**: Delays onChange calls until user stops typing
 * - **Generic type support**: Works with any data type (strings, numbers, arrays, objects)
 * - **Immediate value updates**: UI stays responsive during debouncing
 * - **Blur flushing**: Immediately applies pending changes on blur
 *
 * **Note:** Value transformations should be handled at the `useUniformField` level,
 * not in this hook. This hook only handles debouncing timing.
 *
 * @param options Configuration for debounced value handling
 * @param options.debounceDelay Delay in milliseconds (default: 300)
 * @param options.onBlur Function to call after flushing debounced value
 * @param options.onChange Function to call with debounced value
 * @param options.value The field value
 * @returns Object containing enhanced onChange, onBlur, and immediate value
 *
 * @example
 * Basic usage with debouncing:
 * ```tsx
 * const { onChange, onBlur, value } = useInputValueDebounce({
 *   debounceDelay: 300,
 *   onBlur: field.onBlur,
 *   onChange: field.onChange,
 *   value: field.value,
 * });
 * ```
 */
export const useInputValueDebounce = <TValue = unknown>({
  debounceDelay = 300,
  onBlur,
  onChange,
  value,
}: UseInputValueDebounceOptions<TValue>): UseInputValueDebounceReturn<TValue> => {
  // Track value for synchronous updates
  const [currentValue, setCurrentValue] = useState<TValue>(value);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with external value changes
  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  // Enhanced onChange handler with debouncing
  const handleChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (...event: any[]) => {
      // Extract the raw value
      const newValue = (event[0]?.target?.value ?? event[0]) as TValue;
      setCurrentValue(newValue);

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const executeOnChange = () => {
        // Preserve event structure if original was an event
        if (event[0]?.target) {
          const convertedEvent = {
            ...event[0],
            target: {
              ...event[0].target,
              value: newValue,
            },
          };
          onChange(convertedEvent, ...event.slice(1));
        } else {
          onChange(newValue);
        }
      };

      // Execute immediately or after delay
      if (debounceDelay <= 0) {
        executeOnChange();
      } else {
        timeoutRef.current = setTimeout(executeOnChange, debounceDelay);
      }
    },
    [onChange, debounceDelay],
  );

  // Enhanced blur handler
  const handleBlur = useCallback(() => {
    // Flush pending changes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      onChange(currentValue);
    }
    onBlur();
  }, [onChange, onBlur, currentValue]);

  return {
    onChange: handleChange,
    onBlur: handleBlur,
    value: currentValue,
  };
};
