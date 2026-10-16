import type { ReactNode } from 'react';
import type { InputValueTransform } from '../hooks/useInputValueTransform';
import type { ClassName, VariantProps } from './checkboxesVariants';

import useUniformField from '../hooks/useUniformField/useUniformField';
import CheckboxesControl from './subcomponents/CheckboxesControl';

export { checkboxesVariants } from './checkboxesVariants';

export interface CheckboxOption {
  /** Field label */
  label?: ReactNode;
  /** subline displayed below the label */
  labelSubline?: ReactNode;
  /** Arbitrary option metadata for custom render logic. */
  meta?: Record<string, unknown>;
  /** option value */
  value: string;
  /** Disables the field */
  disabled?: boolean;
  /** HTML data-testid attribute for e2e tests */
  testId?: string;
}

interface ChildRenderOption {
  /** Prebuilt checkbox element for custom option layouts */
  checkbox: ReactNode;
  /** Option data as provided in `options` */
  option: CheckboxOption;
  /** Render-state flags for this option */
  state: {
    /** Whether this option is currently selected */
    checked: boolean;
    /** Disables the field */
    disabled: boolean;
    /** Whether the checkbox group is invalid */
    invalid: boolean;
  };
}

export interface CheckboxesProps extends VariantProps {
  /** Custom accessible name */
  ariaLabel?: string;
  /** Optional child render function for custom full-list layout rendering. */
  children?: (options: ChildRenderOption[]) => ReactNode;
  /** CSS class name */
  className?: ClassName;
  /** Color scheme of the checkboxes */
  color?: VariantProps['color'];
  /** Disables the field */
  disabled?: boolean;
  /** Help text associated with the field */
  description?: ReactNode;
  /** Arranges options horizontally */
  inline?: boolean;
  /** Field label */
  label?: ReactNode;
  /** Whether the checkboxes label should be crossed out */
  lineThrough?: boolean;
  /** Field name */
  name: string;
  /** Available options */
  options: CheckboxOption[];

  /** HTML data-testid attribute for e2e tests */
  testId?: string;
  /** allows disentangled display and form values for a field */
  transform?: InputValueTransform<string[]>;
}

/** Form selection field for multiple checkbox options */
const Checkboxes = ({
  children = undefined,
  className = undefined,
  color = 'primary',
  inline = false,
  lineThrough = false,
  name,
  options,
  ...uniformFieldProps
}: CheckboxesProps) => {
  const {
    field,
    disabled,
    description,
    errorMessage,
    getControlProps,
    ids,
    invalid,
    label,
    ref,
    required,
    testId,
  } = useUniformField({ ...uniformFieldProps, isArrayValue: true, name });
  const value = Array.isArray(field.value) ? (field.value as string[]) : [];

  return (
    <CheckboxesControl
      className={className}
      color={color}
      controlProps={getControlProps()}
      description={description}
      disabled={disabled}
      errorMessage={errorMessage}
      ids={ids}
      inline={inline}
      inputRef={ref}
      invalid={invalid}
      label={label}
      lineThrough={lineThrough}
      name={name}
      onBlur={field.onBlur}
      onValueChange={field.onChange}
      options={options}
      required={required}
      testId={testId}
      value={value}
    >
      {children}
    </CheckboxesControl>
  );
};

export default Checkboxes;
