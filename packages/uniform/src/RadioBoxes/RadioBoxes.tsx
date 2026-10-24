import type { ReactNode } from 'react';
import type { ClassName, VariantProps } from './radioBoxesVariants';

import useUniformField from '../hooks/useUniformField/useUniformField';
import RadioBoxesControl from './subcomponents/RadioBoxesControl';

export { radioBoxesVariants } from './radioBoxesVariants';

export interface RadioBoxOption {
  /** Help text associated with the field */
  description?: ReactNode;
  /** Disables the field */
  disabled?: boolean;
  /** option icon */
  icon?: ReactNode;
  /** Field label */
  label?: ReactNode;
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
  /** Help text associated with the field */
  description?: ReactNode;
  /** Disables the field */
  disabled?: boolean;
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
  const { field } = useUniformField({ ...uniformFieldProps, name });

  return (
    <RadioBoxesControl
      className={className}
      field={field}
      inline={inline}
      options={options}
    />
  );
};

export default RadioBoxes;
