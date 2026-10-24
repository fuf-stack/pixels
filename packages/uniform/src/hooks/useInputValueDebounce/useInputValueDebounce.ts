import { useCallback, useRef, useState } from 'react';

import { useFormContext } from '../useFormContext';
import { useWatchFormReset } from '../useWatchFormReset';

export interface UseInputValueDebounceOptions<TValue = unknown> {
  /** Debounce delay in milliseconds (default: 300) */
  debounceDelay?: number;
  /** Immediate display value when cleared, otherwise follows the reset form value */
  emptyValue?: TValue;
  /** Field name for triggering validation after debounced value commits */
  name: string;
  /** The onBlur function to call after flushing debounced value */
  onBlur: () => void;
  /** The onChange function to call with debounced value */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (...event: any[]) => void;
  /** The field value */
  value: TValue;
}

export interface UseInputValueDebounceReturn<TValue = unknown> {
  /** Cancel queued edits and replace only the displayed value (for clear/reset). */
  cancelPendingChange: (value: TValue) => void;
  /** Cancels pending edits and resets the field to null */
  clear: () => void;
  /** Enhanced onBlur function that flushes current value immediately */
  onBlur: () => void;
  /** Enhanced onChange function with debouncing */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (...event: any[]) => void;
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
 * **Note:** Value transformations should be handled at the private field-state level,
 * not in this hook. Clearing cancels queued edits before resetting the form field.
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
 *   name: 'fieldName',
 *   onBlur: field.onBlur,
 *   onChange: field.onChange,
 *   value: field.value,
 * });
 * ```
 */
export const useInputValueDebounce = <TValue = unknown>({
  debounceDelay = 300,
  name,
  onBlur,
  onChange,
  value,
  emptyValue = value,
}: UseInputValueDebounceOptions<TValue>): UseInputValueDebounceReturn<TValue> => {
  const { resetField, trigger } = useFormContext();

  // Track value for synchronous updates
  const [currentValue, setCurrentValue] = useState<TValue>(value);
  const [lastExternalValue, setLastExternalValue] = useState<TValue>(value);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cancelPendingChange = useCallback((nextValue: TValue) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setCurrentValue(nextValue);
  }, []);

  // cancel queued edits before resetting, so they cannot restore the old value
  const clear = useCallback(() => {
    cancelPendingChange(emptyValue);
    resetField(name, { defaultValue: null });
  }, [cancelPendingChange, emptyValue, name, resetField]);

  useWatchFormReset({
    onReset: useCallback(() => {
      cancelPendingChange(value);
    }, [cancelPendingChange, value]),
  });

  // Keep the displayed value in sync during the same render when the form
  // replaces it (for example after reset), without an extra effect render.
  if (!Object.is(lastExternalValue, value)) {
    setLastExternalValue(value);
    setCurrentValue(value);
  }

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
        // Trigger validation after debounced value commits
        // This ensures errors are updated immediately when field becomes valid
        trigger(name);
      };

      // Execute immediately or after delay
      if (debounceDelay <= 0) {
        executeOnChange();
      } else {
        timeoutRef.current = setTimeout(executeOnChange, debounceDelay);
      }
    },
    [onChange, debounceDelay, trigger, name],
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
    cancelPendingChange,
    clear,
    onChange: handleChange,
    onBlur: handleBlur,
    value: currentValue,
  };
};
