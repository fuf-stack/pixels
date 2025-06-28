import { useEffect, useRef, useState } from 'react';

export interface InputValueTransform {
  /** Transforms the form value to display value (e.g., 1000 → "$1,000") */
  displayValue: (value: string | number) => string | number;
  /** Transforms the display value to form value (e.g., "$1,000" → 1000) */
  formValue: (value: string) => string | number;
}

export interface UseInputValueTransformOptions {
  /** The current form field value */
  value: string | number;
  /** Input type for special number handling */
  type?: 'text' | 'number' | 'password';
  /** Value transformation functions */
  transformValue?: InputValueTransform;
}

export interface UseInputValueTransformReturn {
  /** The current display value for the input */
  displayValue: string | number;
  /** Input change handler (pass directly to onChange) */
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Gets the form value from current display value */
  getFormValue: () => string | number;
}

/**
 * Custom hook for handling input value transformations between display and form values.
 *
 * This hook manages the separation between what the user sees (display value) and what gets
 * stored in the form (form value). It's particularly useful for:
 * - Currency formatting ($1,000 display vs 1000 stored)
 * - Number inputs with special handling
 * - Date formatting (MM/DD/YYYY display vs ISO date stored)
 * - Phone number formatting ((555) 123-4567 display vs 5551234567 stored)
 *
 * **Key Features:**
 * - Immediate display value updates for responsive UI
 * - Automatic external value synchronization (form resets, setValue calls)
 * - Special number input handling (empty string preservation)
 * - Bidirectional value transformations
 *
 * @param options Configuration for value transformation
 * @returns Display value management and form value conversion
 *
 * @example
 * ```tsx
 * // Currency formatting
 * const currencyTransform = {
 *   displayValue: (val) => val ? `$${Number(val).toLocaleString()}` : '',
 *   formValue: (val) => parseFloat(val.replace(/[$,]/g, '')) || 0
 * };
 *
 * const { displayValue, handleInputChange, getFormValue } = useInputValueTransform({
 *   value: 1000,
 *   transformValue: currencyTransform
 * });
 * // displayValue = "$1,000"
 * // getFormValue() = 1000
 * ```
 *
 * @example
 * ```tsx
 * // Phone number formatting
 * const phoneTransform = {
 *   displayValue: (val) => {
 *     const cleaned = val.toString().replace(/\D/g, '');
 *     const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
 *     return match ? `(${match[1]}) ${match[2]}-${match[3]}` : val;
 *   },
 *   formValue: (val) => val.replace(/\D/g, '')
 * };
 *
 * const { displayValue, handleInputChange, getFormValue } = useInputValueTransform({
 *   value: '5551234567',
 *   transformValue: phoneTransform
 * });
 * // displayValue = "(555) 123-4567"
 * // getFormValue() = "5551234567"
 * ```
 *
 * @example
 * ```tsx
 * // Number input (no transforms needed)
 * const { displayValue, handleInputChange, getFormValue } = useInputValueTransform({
 *   value: 42,
 *   type: 'number'
 * });
 * // Handles empty string → empty string (not NaN)
 * // Handles "123" → 123 (string to number conversion)
 * ```
 *
 * @example
 * ```tsx
 * // Usage in a form component
 * const MyInput = ({ field, transformValue }) => {
 *   const { displayValue, handleInputChange, getFormValue } = useInputValueTransform({
 *     value: field.value,
 *     transformValue
 *   });
 *
 *   // Debounce the form updates (optional)
 *   useInputValueDebounce({
 *     value: getFormValue(),
 *     onChange: field.onChange,
 *     debounceDelay: 300
 *   });
 *
 *   return (
 *     <input
 *       value={displayValue}
 *       onChange={handleInputChange}
 *     />
 *   );
 * };
 * ```
 */
export const useInputValueTransform = ({
  value,
  type,
  transformValue,
}: UseInputValueTransformOptions): UseInputValueTransformReturn => {
  // Track previous external value to detect real external changes
  const prevExternalValue = useRef(value);

  // Local state for immediate display updates
  const [displayValue, setDisplayValue] = useState(() => {
    return transformValue?.displayValue
      ? transformValue.displayValue(value ?? '')
      : (value ?? '');
  });

  /**
   * Synchronizes display value when form value changes externally.
   *
   * This handles cases like:
   * - Form resets: reset() or setValue('field', '')
   * - External updates: setValue('field', 'new value')
   * - Default value initialization from form state
   * - Programmatic field updates from other components
   *
   * Uses a ref to track the previous value and only updates when the external
   * value actually changes, preventing infinite re-renders.
   */
  useEffect(() => {
    // Only process if the external value actually changed
    if (value !== prevExternalValue.current) {
      prevExternalValue.current = value;

      const newDisplayValue = transformValue?.displayValue
        ? transformValue.displayValue(value ?? '')
        : (value ?? '');

      setDisplayValue(newDisplayValue);
    }
  }, [value, transformValue]);

  /**
   * Converts the current display value to the appropriate form value.
   *
   * **Conversion Logic:**
   * 1. **Number inputs**:
   *    - Empty string → empty string (preserves empty state, prevents NaN)
   *    - Non-empty string → Number(value) (converts to numeric form)
   *    - Example: "" → "", "42" → 42, "3.14" → 3.14
   *
   * 2. **Transform inputs**:
   *    - Applies custom formValue transform function
   *    - Used for converting display format back to storage format
   *    - Example: "$1,000" → 1000, "(555) 123-4567" → "5551234567"
   *
   * 3. **Regular inputs**:
   *    - Passes through the display value unchanged
   *    - Example: "hello" → "hello", "test@example.com" → "test@example.com"
   *
   * @returns The form value ready for storage/submission
   */
  const getFormValue = (): string | number => {
    if (type === 'number') {
      return displayValue === '' ? '' : Number(displayValue);
    }

    return transformValue?.formValue
      ? transformValue.formValue(displayValue as string)
      : displayValue;
  };

  return {
    displayValue,
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setDisplayValue(e.target.value);
    },
    getFormValue,
  };
};
