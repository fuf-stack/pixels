import type { TabsProps } from '@fuf-stack/pixels';
import type { ReactElement, ReactNode } from 'react';
import type { ClassName, VariantProps } from './radioTabsVariants';

import useUniformField from '../hooks/useUniformField/useUniformField';
import RadioTabsControl from './subcomponents/RadioTabsControl';

export { default as radioTabsVariants } from './radioTabsVariants';

export interface RadioTabOption {
  /** Optional content inside of the tab */
  content?: ReactNode;
  /** Disables the field */
  disabled?: boolean;
  /** option icon */
  icon?: ReactNode;
  /** Field label */
  label?: ReactNode;
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
  /** Help text associated with the field */
  description?: ReactNode;
  /** Disables the field */
  disabled?: boolean;
  /** Whether tabs should take up full container width */
  fullWidth?: boolean;
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
  const { field } = useUniformField({ ...uniformFieldProps, name });

  return (
    <RadioTabsControl
      className={className}
      field={field}
      fullWidth={fullWidth}
      inline={inline}
      options={options}
      variant={variant}
    />
  );
};

export default RadioTabs;
