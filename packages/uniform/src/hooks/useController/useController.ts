import type {
  ControllerFieldState,
  ControllerRenderProps,
  UseControllerProps as RHFUseControllerProps,
  UseFormStateReturn,
} from 'react-hook-form';

import { useController as useRHFController } from 'react-hook-form';

import { fromNullishString, toNullishString } from '../../helpers';

export type UseControllerProps<TFieldValues extends object = object> =
  RHFUseControllerProps<TFieldValues>;

export interface UseControllerReturn<TFieldValues extends object = object> {
  field: Omit<ControllerRenderProps<TFieldValues>, 'onChange' | 'value'> & {
    // Using any[] to support both direct value changes and React synthetic events
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onChange: (...event: any[]) => void;
    value: string;
  };
  formState: UseFormStateReturn<TFieldValues>;
  fieldState: ControllerFieldState;
}

/**
 * A wrapper around react-hook-form's useController that transparently handles nullish string conversions.
 *
 * Key features:
 * 1. Empty strings ('') in the UI are stored as null in form state
 * 2. Null/undefined values in form state are displayed as empty strings in the UI
 * 3. Handles both direct value changes and React synthetic events
 * 4. Maintains the same API as react-hook-form's useController
 *
 * This enables consistent handling of empty/null values while keeping a clean API
 * for form inputs that expect string values.
 *
 * @see https://react-hook-form.com/docs/usecontroller
 */
export const useController = <TFieldValues extends object = object>(
  props: UseControllerProps<TFieldValues>,
): UseControllerReturn<TFieldValues> => {
  const { field, formState, fieldState } = useRHFController(props);

  return {
    field: {
      ...field,
      // Handles both direct values (onChange("value")) and events (onChange(event))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onChange: (...event: any[]) => {
        const value = event[0]?.target?.value ?? event[0];
        // Preserve empty strings for required field validation
        // Only convert non-empty values to nullish strings
        field.onChange(value === '' ? '' : toNullishString(value));
      },
      // Convert null/undefined to empty string for UI display
      value: fromNullishString(field.value) as string,
    },
    formState,
    fieldState,
  };
};
