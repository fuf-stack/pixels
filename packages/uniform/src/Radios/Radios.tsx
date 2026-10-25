import type { ReactElement, ReactNode } from 'react';
import type { ClassName, VariantProps } from './radiosVariants';

import useUniformField from '../hooks/useUniformField/useUniformField';
import RadiosControl from './subcomponents/RadiosControl';

export { radiosVariants } from './radiosVariants';

export interface RadioOption {
  /** Disables the field */
  disabled?: boolean;
  /** option icon */
  icon?: ReactNode;
  /** Field label */
  label?: ReactNode;
  /** Arbitrary option metadata for custom render logic. */
  meta?: Record<string, unknown>;
  /** HTML data-testid attribute for e2e tests */
  testId?: string;
  /** option value */
  value: string | number;
}

export interface RadioRenderedOption {
  /** Option data as provided in `options` */
  option: RadioOption;
  /** Prebuilt radio element for custom option layouts */
  radio: ReactNode;
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
  const { field } = useUniformField({ ...uniformFieldProps, name });

  return (
    <RadiosControl
      className={className}
      field={field}
      inline={inline}
      options={options}
    >
      {children}
    </RadiosControl>
  );
};

export default Radios;
