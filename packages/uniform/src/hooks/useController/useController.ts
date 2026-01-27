import type {
  ControllerFieldState,
  ControllerRenderProps,
  UseControllerProps as RHFUseControllerProps,
  UseFormStateReturn,
} from 'react-hook-form';

import { useContext } from 'react';
import { useController as useRHFController } from 'react-hook-form';

import { UniformContext } from '../../Form/subcomponents/FormContext';
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
 * 5. Notifies UniformContext's userChange listeners on field changes (enables useWatchUserChange hook)
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
  const { userChange } = useContext(UniformContext);

  return {
    field: {
      ...field,
      // Handles both direct values (onChange("value")) and events (onChange(event))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onChange: (...event: any[]) => {
        const value = event[0]?.target?.value ?? event[0];
        const formattedValue = value === '' ? '' : toNullishString(value);

        // Update form state first
        field.onChange(formattedValue);

        // Then notify userChange listeners (for useWatchUserChange hook)
        // This ensures getValues() in listeners returns the updated value
        // Guard against undefined userChange (when used outside FormProvider)
        // NOTE: We notify with the original value (not formattedValue) so that
        // listeners receive the actual value (false, 0, null) instead of marker
        // strings like '__FALSE__', '__ZERO__', '__NULL__'
        userChange?.notify(field.name, value);
      },
      // Convert null/undefined to empty string for UI display
      value: fromNullishString(field.value) as string,
    },
    formState,
    fieldState,
  };
};
