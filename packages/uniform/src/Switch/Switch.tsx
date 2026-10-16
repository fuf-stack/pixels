import type { ReactNode } from 'react';
import type { SwitchThumbIconProps } from './subcomponents/SwitchThumb';
import type { ClassName } from './switchVariants';

import useUniformField from '../hooks/useUniformField/useUniformField';
import SwitchControl from './subcomponents/SwitchControl';

export type { SwitchThumbIconProps } from './subcomponents/SwitchThumb';

export { switchVariants } from './switchVariants';

export interface SwitchProps {
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
  /** Control size */
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
  const { field } = useUniformField({
    ...uniformProps,
    name,
  });

  return (
    <SwitchControl
      className={className}
      endContent={endContent}
      field={field}
      size={size}
      startContent={startContent}
      thumbIcon={thumbIcon}
    />
  );
};

export default Switch;
