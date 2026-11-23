import type { ReactNode } from 'react';
import type { ClassName } from './radioBoxVariants';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import RadioControl from '../../Radios/subcomponents/RadioControl';
import { radioBoxVariants } from './radioBoxVariants';

export interface RadioBoxProps {
  /** Option label. */
  children?: ReactNode;
  /** CSS class name */
  className?: ClassName;
  /** Legacy alias for className */
  classNames?: ClassName;
  /** HTML test ID for the option. */
  'data-testid'?: string;
  /** Help text associated with the field */
  description?: ReactNode;
  /** Disables the option */
  disabled?: boolean;
  /** icon for the option */
  icon?: ReactNode;
  /** Marks the option as invalid */
  invalid?: boolean;
  /** String value managed by the containing radio group. */
  value: string;
}

/**
 * Selectable radio box with an icon, supporting text and selection indicator
 *
 * @see https://react-aria.adobe.com/RadioGroup
 */
export const RadioBox = ({
  className = undefined,
  classNames: _classNames = undefined,
  icon = undefined,
  invalid = false,
  disabled = false,
  description = undefined,
  children = undefined,
  value,
  ...props
}: RadioBoxProps) => {
  const styling = useStyling();

  // classNames from slots
  const variants = styling.resolve(radioBoxVariants, { disabled, invalid });
  const classNames = styling.variantsToClassNames(
    variants,
    _classNames ?? className,
    'base',
  );

  return (
    <RadioControl
      className={classNames}
      description={description}
      disabled={disabled}
      icon={icon}
      invalid={invalid}
      testId={props['data-testid']}
      value={value}
    >
      {children}
    </RadioControl>
  );
};

export default RadioBox;
