import { useCallback } from 'react';

export interface InputValueTransform<TDisplay = unknown> {
  /** Transforms the form value to display value (e.g., 1000 → "$1,000" or 'a' → ['a']) */
  toDisplayValue: (value: unknown) => TDisplay;
  /** Transforms the display value to form value (e.g., "$1,000" → 1000 or ['a'] → 'a') */
  toFormValue: (value: TDisplay) => unknown;
}

export interface UseInputValueTransformOptions<TDisplay = unknown> {
  /** Input type for special number handling */
  type?: 'text' | 'number' | 'password';
  /** Value transformation functions */
  transform?: InputValueTransform<TDisplay>;
}

export interface UseInputValueTransformReturn<TDisplay = unknown> {
  /** Converts any form value to display value */
  toDisplayValue: (formValue: unknown) => TDisplay;
  /** Converts any display value to form value */
  toFormValue: (displayValue: TDisplay) => unknown;
}

/**
 * Custom hook providing utility functions for value transformations between display and form values.
 *
 * This hook provides pure conversion functions without any state management. It's useful for:
 * - Currency formatting ($1,000 display vs 1000 stored)
 * - Number inputs with special handling
 * - Date formatting (MM/DD/YYYY display vs ISO date stored)
 * - Phone number formatting ((555) 123-4567 display vs 5551234567 stored)
 * - Array/Object transformations (single value ↔ array, nested structures)
 *
 * **Key Features:**
 * - Pure conversion functions (no state)
 * - Generic support for any data type (strings, numbers, arrays, objects)
 * - Special number input handling (empty string preservation)
 * - Bidirectional value transformations
 * - Memoized functions for performance
 *
 * @param options Configuration for value transformation
 * @returns Pure conversion utility functions
 *
 * @example
 * ```tsx
 * // Currency formatting
 * const currencyTransform = {
 *   toDisplayValue: (val) => val ? `$${Number(val).toLocaleString()}` : '',
 *   toFormValue: (val) => parseFloat(val.replace(/[$,]/g, '')) || 0
 * };
 *
 * const { toDisplayValue, toFormValue } = useInputValueTransform({
 *   transform: currencyTransform
 * });
 *
 * const displayVal = toDisplayValue(1000); // "$1,000"
 * const formVal = toFormValue("$1,500"); // 1500
 * ```
 *
 * @example
 * ```tsx
 * // Number input (no transforms needed)
 * const { toDisplayValue, toFormValue } = useInputValueTransform({
 *   type: 'number'
 * });
 *
 * // Handles empty string → empty string (not NaN)
 * // Handles "123" → 123 (string to number conversion)
 * ```
 *
 * @example
 * ```tsx
 * // Array to single value (for single checkbox)
 * const singleValueTransform = {
 *   toDisplayValue: (val: string[]) => val?.[0] || '',
 *   toFormValue: (val: string) => val ? [val] : []
 * };
 *
 * const { toDisplayValue, toFormValue } = useInputValueTransform({
 *   transform: singleValueTransform
 * });
 *
 * const displayVal = toDisplayValue(['option1']); // "option1"
 * const formVal = toFormValue("option2"); // ["option2"]
 * ```
 *
 * @example
 * ```tsx
 * // Integration with debouncing
 * const MyInput = ({ field, transform }) => {
 *   const transform = useInputValueTransform({ transform });
 *
 *   const { onChange, onBlur, value } = useInputValueDebounce({
 *     ...transform,
 *     debounceDelay: 300,
 *     name: 'fieldName',
 *     onBlur: field.onBlur,
 *     onChange: field.onChange,
 *     value: field.value,
 *   });
 *
 *   return <input value={value} onChange={onChange} onBlur={onBlur} />;
 * };
 * ```
 */
export const useInputValueTransform = <TDisplay = unknown>({
  type,
  transform,
}: UseInputValueTransformOptions<TDisplay>): UseInputValueTransformReturn<TDisplay> => {
  /**
   * Converts any form value to display value
   */
  const toDisplayValue = useCallback(
    (formValue: unknown): TDisplay => {
      if (transform?.toDisplayValue) {
        return transform.toDisplayValue(formValue);
      }

      // For number type, convert valid strings to numbers for display
      if (type === 'number') {
        if (formValue === '') {
          return '' as TDisplay;
        }
        const numValue = Number(formValue);
        return (Number.isNaN(numValue) ? formValue : numValue) as TDisplay;
      }

      // Default: pass through (handles primitives, arrays, objects, etc.)
      return (formValue ?? '') as TDisplay;
    },
    [type, transform],
  );

  /**
   * Converts any display value to form value
   */
  const toFormValue = useCallback(
    (displayValue: TDisplay): unknown => {
      if (transform?.toFormValue) {
        return transform.toFormValue(displayValue);
      }

      // For number type, convert strings to numbers
      if (type === 'number') {
        if (displayValue === '') {
          return '';
        }
        const numValue = Number(displayValue);
        return Number.isNaN(numValue) ? displayValue : numValue;
      }

      // Default: pass through (handles primitives, arrays, objects, etc.)
      return displayValue;
    },
    [type, transform],
  );

  return {
    toDisplayValue,
    toFormValue,
  };
};
