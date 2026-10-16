import type { TabsProps } from '@fuf-stack/pixels';
import type { ReactElement, ReactNode } from 'react';
import type { ClassName, VariantProps } from './radioTabsVariants';

import { createOptionValueConverter } from '../helpers';
import useUniformField from '../hooks/useUniformField/useUniformField';
import RadioTabsControl from './subcomponents/RadioTabsControl';

export { default as radioTabsVariants } from './radioTabsVariants';

export interface RadioTabOption {
  /** Optional content inside of the tab */
  content?: ReactNode;
  /** Disables the field */
  disabled?: boolean;
  /** Field label */
  label?: ReactNode;
  /** option icon */
  icon?: ReactNode;
  /** HTML data-testid attribute for e2e tests */
  testId?: string;
  /** option value */
  value: string | number | boolean;
}

export interface RadioTabsProps extends Omit<
  VariantProps,
  'appearance' | 'hasContent'
> {
  /** Custom accessible name */
  ariaLabel?: string;
  /** CSS class name */
  className?: ClassName;
  /** Disables the field */
  disabled?: boolean;
  /** Whether tabs should take up full container width */
  fullWidth?: boolean;
  /** Help text associated with the field */
  description?: ReactNode;
  /** Arranges options horizontally */
  inline?: boolean;
  /** Field label */
  label?: ReactNode;
  /** Field name */
  name: string;
  /** Available options */
  options: RadioTabOption[];
  /** HTML data-testid attribute for e2e tests */
  testId?: string;
  /** How the RadioTabs should look like. */
  variant?: TabsProps['variant'];
}

/** Form selection field displayed as tabs with optional panels */
const RadioTabs = ({
  className = undefined,
  fullWidth = false,
  inline = false,
  name,
  options,
  variant = undefined,
  ...uniformFieldProps
}: RadioTabsProps): ReactElement => {
  const {
    field,
    ariaLabel,
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
  } = useUniformField({ ...uniformFieldProps, name });
  const { convertToOriginalType } = createOptionValueConverter(options);

  // restore the selected option's original value type
  const handleChange = (key: string) => {
    field.onChange(convertToOriginalType(key));
  };

  return (
    <RadioTabsControl
      ariaLabel={ariaLabel}
      className={className}
      controlProps={getControlProps()}
      description={description}
      disabled={disabled}
      errorMessage={errorMessage}
      fullWidth={fullWidth}
      ids={ids}
      inline={inline}
      inputRef={ref}
      invalid={invalid}
      label={label}
      onBlur={field.onBlur}
      onValueChange={handleChange}
      options={options}
      required={required}
      testId={testId}
      value={field.value}
      variant={variant}
    />
  );
};

export default RadioTabs;
