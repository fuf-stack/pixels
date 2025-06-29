import type { InputValueTransform } from '../useInputValueTransform/useInputValueTransform';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useInputValueTransform } from '../useInputValueTransform/useInputValueTransform';

export interface UseInputValueDebounceOptions {
  /** Debounce delay in milliseconds (default: 300) */
  debounceDelay?: number;
  /** The onBlur function to call after flushing debounced value */
  onBlur: () => void;
  /** The onChange function to call with debounced value */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (...event: any[]) => void;
  /** Value transformation functions */
  transformValue?: InputValueTransform;
  /** Input type to handle number conversion (optional) */
  type?: 'text' | 'number' | 'password';
  /** The initial form value */
  value: string | number;
}

export interface UseInputValueDebounceReturn {
  /** Enhanced onChange function with debouncing */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (...event: any[]) => void;
  /** Enhanced onBlur function that flushes current value immediately */
  onBlur: () => void;
  /** The field value that is displayed - updates immediately */
  value: string | number;
}

/**
 * Custom hook for debouncing input value changes with immediate blur support.
 *
 * Provides immediate visual feedback by updating the display value instantly,
 * while debouncing the actual form state changes. When the input loses focus,
 * any pending debounced changes are immediately flushed.
 *
 * **Key Features:**
 * - **Debouncing**: Delays form updates until user stops typing
 * - **Transform support**: Optional value transformation between display and form values
 * - **Number conversion**: Automatic conversion for number inputs
 * - **Immediate display updates**: UI stays responsive during debouncing
 * - **Blur flushing**: Immediately applies pending changes on blur
 *
 * @param options Configuration for debounced value handling
 * @param options.debounceDelay Delay in milliseconds (default: 300)
 * @param options.onBlur Function to call after flushing debounced value
 * @param options.onChange Function to call with debounced value
 * @param options.transformValue Optional transform functions for display ↔ form value conversion
 * @param options.type Input type for number conversion ('text' | 'number' | 'password')
 * @param options.value The initial form value
 * @returns Object containing enhanced onChange, onBlur, and immediate display value
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
 *
 * @example
 * Number input with automatic conversion:
 * ```tsx
 * const { onChange, onBlur, value } = useInputValueDebounce({
 *   debounceDelay: 300,
 *   onBlur: field.onBlur,
 *   onChange: field.onChange,
 *   type: 'number',
 *   value: field.value, // Display: 123 (number), Form: 123 (number)
 * });
 * ```
 *
 * @example
 * Currency formatting with transforms:
 * ```tsx
 * const currencyTransform = {
 *   displayValue: (val) => val ? `$${Number(val).toFixed(2)}` : '',
 *   formValue: (val) => Number(val.replace(/[$,]/g, '')) || 0
 * };
 *
 * const { onChange, onBlur, value } = useInputValueDebounce({
 *   debounceDelay: 300,
 *   onBlur: field.onBlur,
 *   onChange: field.onChange,
 *   transformValue: currencyTransform,
 *   value: field.value, // Display: "$100.00", Form: 100
 * });
 * ```
 */
export const useInputValueDebounce = ({
  debounceDelay = 300,
  onBlur,
  onChange,
  transformValue,
  type,
  value,
}: UseInputValueDebounceOptions): UseInputValueDebounceReturn => {
  // Get conversion utilities from transform hook
  const { toDisplayValue, toFormValue } = useInputValueTransform({
    transformValue,
    type,
  });

  // Track display value for synchronous updates
  const [displayValue, setDisplayValue] = useState(() => toDisplayValue(value));

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with external value changes
  useEffect(() => {
    setDisplayValue(toDisplayValue(value));
  }, [value, toDisplayValue]);

  // Enhanced onChange handler with debouncing
  const handleChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (...event: any[]) => {
      // Extract the raw input value
      const rawValue = event[0]?.target?.value ?? event[0];

      // For transforms, user input is already in display format
      // For number types, convert strings to numbers for display
      const newDisplayValue = transformValue
        ? rawValue
        : toDisplayValue(rawValue);
      setDisplayValue(newDisplayValue);

      // Convert to form value using transform utilities
      const formValue = toFormValue(newDisplayValue);

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
              value: formValue,
            },
          };
          onChange(convertedEvent, ...event.slice(1));
        } else {
          onChange(formValue);
        }
      };

      // Execute immediately or after delay
      if (debounceDelay <= 0) {
        executeOnChange();
      } else {
        timeoutRef.current = setTimeout(executeOnChange, debounceDelay);
      }
    },
    [onChange, debounceDelay, toDisplayValue, toFormValue, transformValue],
  );

  // Enhanced blur handler
  const handleBlur = useCallback(() => {
    // Flush pending changes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;

      // Get form value from current display value
      const formValue = toFormValue(displayValue);
      onChange(formValue);
    }
    onBlur();
  }, [onChange, onBlur, toFormValue, displayValue]);

  return {
    onChange: handleChange,
    onBlur: handleBlur,
    value: displayValue,
  };
};
