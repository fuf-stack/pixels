import type { ReactNode } from 'react';
import type { ClassName, VariantProps } from './radioBoxesVariants';

import { createOptionValueConverter } from '../helpers';
import useUniformField from '../hooks/useUniformField/useUniformField';
import RadioBoxesControl from './subcomponents/RadioBoxesControl';

export { radioBoxesVariants } from './radioBoxesVariants';

export interface RadioBoxOption {
  /** Help text associated with the field */
  description?: ReactNode;
  /** Disables the field */
  disabled?: boolean;
  /** Field label */
  label?: ReactNode;
  /** option icon */
  icon?: ReactNode;
  /** HTML data-testid attribute for e2e tests */
  testId?: string;
  /** option value */
  value: string | number;
}

export interface RadioBoxesProps extends VariantProps {
  /** Custom accessible name */
  ariaLabel?: string;
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
  options: RadioBoxOption[];
  /** HTML data-testid attribute for e2e tests */
  testId?: string;
}

/** Form selection field for one option displayed as a box */
const RadioBoxes = ({
  className = undefined,
  inline = false,
  name,
  options,
  ...uniformFieldProps
}: RadioBoxesProps) => {
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
    <RadioBoxesControl
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
    />
  );
};

export default RadioBoxes;
