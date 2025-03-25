import type {
  ControllerFieldState,
  ControllerRenderProps,
  ControllerProps as RHFControllerProps,
  UseFormStateReturn,
} from 'react-hook-form';

import { Controller as RHFController } from 'react-hook-form';

import { fromNullishString, toNullishString } from '../helpers';

export type ControllerProps<TFieldValues extends object = object> = Omit<
  RHFControllerProps<TFieldValues>,
  'render'
> & {
  /**
   * Render prop that receives the form control props with nullish string handling.
   * The field object contains all the properties needed to control an input:
   * - onChange: Handles both direct value changes and event objects
   * - value: Always provides a string value, converting null/undefined to empty string
   * - name, ref, etc: Other standard field properties from react-hook-form
   */
  render: (props: {
    field: Omit<ControllerRenderProps<TFieldValues>, 'onChange' | 'value'> & {
      // Using any[] to support both direct value changes and React synthetic events
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onChange: (...event: any[]) => void;
      value: string;
    };
    formState: UseFormStateReturn<TFieldValues>;
    fieldState: ControllerFieldState;
  }) => React.ReactElement;
};

/**
 * A wrapper around react-hook-form's Controller that transparently handles nullish string conversions.
 *
 * Key features:
 * 1. Empty strings ('') in the UI are stored as null in form state
 * 2. Null/undefined values in form state are displayed as empty strings in the UI
 * 3. Handles both direct value changes and React synthetic events
 * 4. Maintains the same API as react-hook-form's Controller
 *
 * This enables consistent handling of empty/null values while keeping a clean API
 * for form inputs that expect string values.
 *
 * @see https://react-hook-form.com/docs/usecontroller/controller
 */
const Controller = <TFieldValues extends object = object>({
  render,
  ...props
}: ControllerProps<TFieldValues>) => {
  return (
    <RHFController<TFieldValues>
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      // INFO: prevent 'A component is changing an uncontrolled input to be controlled'
      disabled={props.disabled || undefined}
      render={({ field, ...rest }) => {
        return render({
          field: {
            ...field,
            // Handles both direct values (onChange("value")) and events (onChange(event))
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange: (...event: any[]) => {
              const value = event[0]?.target?.value ?? event[0];
              field.onChange(toNullishString(value));
            },
            // Convert null/undefined to empty string for UI display
            value: fromNullishString(field.value) as string,
          },
          ...rest,
        });
      }}
    />
  );
};

export default Controller;
