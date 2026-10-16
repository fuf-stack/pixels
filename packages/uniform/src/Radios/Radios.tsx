import type { ReactElement, ReactNode } from 'react';
import type { ClassName, VariantProps } from './radiosVariants';

import { createOptionValueConverter } from '../helpers';
import useUniformField from '../hooks/useUniformField/useUniformField';
import RadiosControl from './subcomponents/RadiosControl';

export { radiosVariants } from './radiosVariants';

export interface RadioOption {
  /** Disables the field */
  disabled?: boolean;
  /** Field label */
  label?: ReactNode;
  /** option icon */
  icon?: ReactNode;
  /** Arbitrary option metadata for custom render logic. */
  meta?: Record<string, unknown>;
  /** HTML data-testid attribute for e2e tests */
  testId?: string;
  /** option value */
  value: string | number;
}

export interface RadioRenderedOption {
  /** Prebuilt radio element for custom option layouts */
  radio: ReactNode;
  /** Option data as provided in `options` */
  option: RadioOption;
  /** Render-state flags for this option */
  state: {
    /** Whether this option is currently selected */
    selected: boolean;
    /** Disables the field */
    disabled: boolean;
    /** Whether the radio group is invalid */
    invalid: boolean;
  };
}

export interface RadiosProps extends VariantProps {
  /** Custom accessible name */
  ariaLabel?: string;
  /** Optional child render function for custom full-list layout rendering. */
  children?: (options: RadioRenderedOption[]) => ReactNode;
  /** CSS class name */
  className?: ClassName;
  /** Disables the field */
  disabled?: boolean;
  /** Help text associated with the field */
  description?: ReactNode;
  /** Arranges options horizontally */
  inline?: boolean;
  /** Field label */
  label?: ReactNode;
  /** Field name */
  name: string;
  /** Available options */
  options: RadioOption[];
  /** HTML data-testid attribute for e2e tests */
  testId?: string;
}

/** Form selection field for one radio option */
const Radios = ({
  children = undefined,
  className = undefined,
  inline = false,
  name,
  options,
  ...uniformFieldProps
}: RadiosProps): ReactElement => {
  const {
    field,
    disabled,
    invalid,
    testId,
    required,
    label,
    description,
    errorMessage,
    ids,
    ref,
    getControlProps,
  } = useUniformField({ ...uniformFieldProps, name });

  const { convertToOriginalType } = createOptionValueConverter(options);

  // restore the option's original value type before updating the form
  const handleChange = (nextValue: string) => {
    field.onChange(convertToOriginalType(nextValue));
  };

  return (
    <RadiosControl
      className={className}
      controlProps={getControlProps()}
      description={description}
      disabled={disabled}
      errorMessage={errorMessage}
      ids={ids}
      inline={inline}
      inputRef={ref}
      invalid={invalid}
      label={label}
      name={name}
      onBlur={field.onBlur}
      onValueChange={handleChange}
      options={options}
      required={required}
      testId={testId}
      value={field.value}
    >
      {children}
    </RadiosControl>
  );
};

export default Radios;
