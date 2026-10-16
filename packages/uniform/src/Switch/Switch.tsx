import type { ReactNode } from 'react';
import type { ClassName, VariantProps } from './switchVariants';

import useUniformField from '../hooks/useUniformField/useUniformField';
import SwitchControl from './subcomponents/SwitchControl';

export { switchVariants } from './switchVariants';

export interface SwitchThumbIconProps {
  width: string;
  height: string;
  'data-checked': string;
  isSelected: boolean;
  className: string;
}

export interface SwitchProps extends VariantProps {
  /** Custom accessible name */
  ariaLabel?: string;
  /** CSS class name */
  className?: ClassName;
  /** Help text associated with the field */
  description?: ReactNode;
  /** Disables the field */
  disabled?: boolean;
  /** Icon to be displayed at the end of the switch (when enabled) */
  endContent?: ReactNode;
  /** Field label */
  label?: ReactNode;
  /** Field name */
  name: string;
  /* Size of the switch */
  size?: 'sm' | 'md' | 'lg';
  /** Icon to be displayed at the start of the switch (when disabled) */
  startContent?: ReactNode;
  /** HTML data-testid attribute for e2e tests */
  testId?: string;
  /** Content or render callback inside the toggle thumb */
  thumbIcon?: ReactNode | ((props: SwitchThumbIconProps) => ReactNode);
}

/** Form toggle field for a boolean value */
const Switch = ({
  className = undefined,
  endContent = undefined,
  name,
  size = 'md',
  startContent = undefined,
  thumbIcon = undefined,
  ...uniformProps
}: SwitchProps) => {
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
  } = useUniformField({ ...uniformProps, name });

  return (
    <SwitchControl
      className={className}
      controlProps={getControlProps()}
      description={fieldDescription}
      disabled={disabled}
      endContent={endContent}
      errorMessage={errorMessage}
      ids={ids}
      inputRef={ref}
      invalid={invalid}
      label={label}
      name={name}
      onBlur={field.onBlur}
      onValueChange={field.onChange}
      required={required}
      size={size}
      startContent={startContent}
      testId={testId}
      thumbIcon={thumbIcon}
      value={field.value}
    />
  );
};

export default Switch;
