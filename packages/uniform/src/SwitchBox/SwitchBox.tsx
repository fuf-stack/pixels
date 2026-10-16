import type { ReactNode } from 'react';
import type { SwitchProps } from '../Switch/Switch';
import type { ClassName } from './switchBoxVariants';

import useUniformField from '../hooks/useUniformField/useUniformField';
import SwitchBoxControl from './subcomponents/SwitchBoxControl';

export { switchBoxVariants } from './switchBoxVariants';

export interface SwitchBoxProps {
  /** CSS class name */
  className?: ClassName;
  /** Help text associated with the field */
  description?: ReactNode;
  /** Disables the field */
  disabled?: boolean;
  /** Icon to be displayed in the box */
  icon?: ReactNode;
  /** Field label */
  label?: ReactNode;
  /** Field name */
  name: string;
  /** whether the field is required */
  required?: boolean;
  /* Size of the switch */
  size?: 'sm' | 'md' | 'lg';
  /** HTML data-testid attribute for e2e tests */
  testId?: string;
  /** Content or render callback inside the toggle thumb */
  thumbIcon?: SwitchProps['thumbIcon'];
}

/** Form toggle field displayed as a selectable box */
const SwitchBox = ({
  className = undefined,
  description = undefined,
  icon = undefined,
  name,
  size = undefined,
  thumbIcon = undefined,
  ...uniformFieldProps
}: SwitchBoxProps) => {
  const {
    field,
    disabled,
    description: fieldDescription,
    errorMessage,
    getControlProps,
    ids,
    invalid,
    label,
    ref,
    required,
    testId,
  } = useUniformField({ ...uniformFieldProps, description, name });

  return (
    <SwitchBoxControl
      className={className}
      controlProps={getControlProps()}
      description={fieldDescription}
      disabled={disabled}
      errorMessage={errorMessage}
      icon={icon}
      ids={ids}
      inputRef={ref}
      invalid={invalid}
      label={label}
      name={name}
      onBlur={field.onBlur}
      onValueChange={field.onChange}
      required={required}
      size={size}
      testId={testId}
      thumbIcon={thumbIcon}
      value={field.value}
    />
  );
};

export default SwitchBox;
