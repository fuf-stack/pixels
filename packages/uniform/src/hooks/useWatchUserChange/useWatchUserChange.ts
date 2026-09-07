import type {
  FieldValues,
  Path,
  UseFormReset,
  UseFormResetField,
  UseFormSetValue,
} from 'react-hook-form';

import { useEffect, useRef } from 'react';

import { useFormContext } from '../useFormContext/useFormContext';

export interface UseWatchUserChangeOptions<TFieldValues extends FieldValues> {
  /** Field name to watch for user changes */
  watch: Path<TFieldValues>;
  /**
   * Callback when watched field is changed by user input.
   * Receives the new value and form helpers (setValue, resetField, reset).
   */
  onChange: (
    value: unknown,
    helpers: {
      setValue: UseFormSetValue<TFieldValues>;
      resetField: UseFormResetField<TFieldValues>;
      reset: UseFormReset<TFieldValues>;
    },
  ) => void;
}

/**
 * Hook that watches for user changes on a specific form field.
 *
 * Only triggers on manual user input (typing, clicking, selecting),
 * NOT on programmatic changes like form.reset() or form.setValue().
 * Also does NOT trigger when selecting the same value (e.g., clicking
 * an already-selected option in a Select).
 *
 * This hook subscribes to field changes at the source (useController),
 * ensuring immediate and accurate detection of user interactions.
 *
 * Use cases:
 * - Reset dependent fields when parent field changes
 * - Set mode-specific default values when a toggle changes
 * - Clear form sections based on user selections
 * - Trigger side effects only on user interaction
 *
 * Note: To watch multiple fields, call this hook multiple times.
 *
 * @example
 * ```tsx
 * // Reset city and address when user changes country
 * useWatchUserChange({
 *   watch: 'country',
 *   onChange: (value, { resetField }) => {
 *     resetField('city');
 *     resetField('address');
 *   },
 * });
 *
 * // Set defaults when user changes payment method
 * useWatchUserChange({
 *   watch: 'paymentMethod',
 *   onChange: (value, { setValue }) => {
 *     if (value === 'credit') {
 *       setValue('installments', 3);
 *     } else {
 *       setValue('installments', 1);
 *     }
 *   },
 * });
 *
 * // Watch multiple fields by calling the hook multiple times
 * useWatchUserChange({
 *   watch: 'category',
 *   onChange: (value, { resetField }) => {
 *     resetField('productId');
 *   },
 * });
 * useWatchUserChange({
 *   watch: 'brand',
 *   onChange: (value, { resetField }) => {
 *     resetField('productId');
 *   },
 * });
 * ```
 */
export const useWatchUserChange = <
  TFieldValues extends FieldValues = FieldValues,
>({
  watch: watchField,
  onChange,
}: UseWatchUserChangeOptions<TFieldValues>) => {
  const { setValue, resetField, reset, userChange } =
    useFormContext<TFieldValues>();

  // Callers commonly pass an inline callback, and useFormContext may return new
  // helper wrappers after a form render. Keep their latest values in a ref so
  // those identity changes do not tear down and recreate the subscription.
  const callbackRef = useRef({ onChange, reset, resetField, setValue });

  useEffect(() => {
    callbackRef.current = { onChange, reset, resetField, setValue };
  }, [onChange, reset, resetField, setValue]);

  // The subscribe function is stable even when the surrounding userChange
  // object is reconstructed. Depending on it directly keeps one active listener.
  const { subscribe } = userChange;

  useEffect(() => {
    // Create listener that checks if changed field is the one we're watching
    const listener = (fieldName: Path<TFieldValues>, value: unknown) => {
      // Check if this is the field we're watching
      if (fieldName === watchField) {
        // Read at notification time so the stable listener never closes over a
        // stale callback or stale form helpers.
        const { onChange: callback, ...helpers } = callbackRef.current;
        callback(value, helpers);
      }
    };

    // Subscribe to user changes
    const unsubscribe = subscribe(listener);

    // Cleanup on unmount
    return unsubscribe;
  }, [subscribe, watchField]);
};
