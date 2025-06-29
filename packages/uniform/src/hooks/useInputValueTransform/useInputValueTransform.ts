import { useCallback } from 'react';

export interface InputValueTransform {
  /** Transforms the form value to display value (e.g., 1000 → "$1,000") */
  toDisplayValue: (value: string | number) => string | number;
  /** Transforms the display value to form value (e.g., "$1,000" → 1000) */
  toFormValue: (value: string) => string | number;
}

export interface UseInputValueTransformOptions {
  /** Input type for special number handling */
  type?: 'text' | 'number' | 'password';
  /** Value transformation functions */
  transformValue?: InputValueTransform;
}

export interface UseInputValueTransformReturn {
  /** Converts any form value to display value */
  toDisplayValue: (formValue: string | number) => string | number;
  /** Converts any display value to form value */
  toFormValue: (displayValue: string | number) => string | number;
}

/**
 * Custom hook providing utility functions for value transformations between display and form values.
 *
 * This hook provides pure conversion functions without any state management. It's useful for:
 * - Currency formatting ($1,000 display vs 1000 stored)
 * - Number inputs with special handling
 * - Date formatting (MM/DD/YYYY display vs ISO date stored)
 * - Phone number formatting ((555) 123-4567 display vs 5551234567 stored)
 *
 * **Key Features:**
 * - Pure conversion functions (no state)
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
 *   displayValue: (val) => val ? `$${Number(val).toLocaleString()}` : '',
 *   formValue: (val) => parseFloat(val.replace(/[$,]/g, '')) || 0
 * };
 *
 * const { toDisplayValue, toFormValue } = useInputValueTransform({
 *   transformValue: currencyTransform
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
 * // Integration with debouncing
 * const MyInput = ({ field, transformValue }) => {
 *   const transform = useInputValueTransform({ transformValue });
 *
 *   const { onChange, onBlur, value } = useInputValueDebounce({
 *     ...transform,
 *     initialValue: field.value,
 *     debounceDelay: 300,
 *     onBlur: field.onBlur,
 *     onChange: field.onChange,
 *   });
 *
 *   return <input value={value} onChange={onChange} onBlur={onBlur} />;
 * };
 * ```
 */
export const useInputValueTransform = ({
  type,
  transformValue,
}: UseInputValueTransformOptions): UseInputValueTransformReturn => {
  /**
   * Converts any form value to display value
   */
  const toDisplayValue = useCallback(
    (formValue: string | number): string | number => {
      if (transformValue?.displayValue) {
        return transformValue.displayValue(formValue ?? '');
      }

      // For number type, convert valid strings to numbers for display
      if (type === 'number') {
        if (formValue === '') return '';
        const numValue = Number(formValue);
        return Number.isNaN(numValue) ? formValue : numValue;
      }

      return formValue ?? '';
    },
    [type, transformValue],
  );

  /**
   * Converts any display value to form value
   */
  const toFormValue = useCallback(
    (displayValue: string | number): string | number => {
      if (type === 'number') {
        if (displayValue === '') return '';
        const numValue = Number(displayValue);
        return Number.isNaN(numValue) ? displayValue : numValue;
      }

      return transformValue?.formValue
        ? transformValue.formValue(displayValue as string)
        : displayValue;
    },
    [type, transformValue],
  );

  return {
    toDisplayValue,
    toFormValue,
  };
};
