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
  /** icon for the option */
  icon?: ReactNode;
  /** Whether the option is disabled. */
  isDisabled?: boolean;
  /** whether the radio is invalid */
  isInvalid?: boolean;
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
  isInvalid = false,
  isDisabled = false,
  description = undefined,
  children = undefined,
  value,
  ...props
}: RadioBoxProps) => {
  const styling = useStyling();

  // classNames from slots
  const variants = styling.resolve(radioBoxVariants, { isDisabled, isInvalid });
  const classNames = styling.variantsToClassNames(
    variants,
    _classNames ?? className,
    'base',
  );

  return (
    <RadioControl
      className={classNames}
      description={description}
      disabled={isDisabled}
      icon={icon}
      invalid={isInvalid}
      testId={props['data-testid']}
      value={value}
    >
      {children}
    </RadioControl>
  );
};

export default RadioBox;
