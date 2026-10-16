import type { ReactNode } from 'react';
import type { ClassName } from './radioBoxVariants';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import RadioControl from '../../Radios/subcomponents/RadioControl';
import radioControlVariants from '../../Radios/subcomponents/radioControlVariants';
import { radioBoxVariants } from './radioBoxVariants';

export interface RadioBoxProps {
  /** Option label. */
  children?: ReactNode;
  /** Help text associated with the field */
  description?: ReactNode;
  /** Whether the option is disabled. */
  isDisabled?: boolean;
  /** String value managed by the containing radio group. */
  value: string;
  /** HTML test ID for the option. */
  'data-testid'?: string;
  /** Legacy alias for className */
  classNames?: ClassName;
  /** CSS class name */
  className?: ClassName;
  /** icon for the option */
  icon?: ReactNode;
  /** whether the radio is invalid */
  isInvalid?: boolean;
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

  const defaults = styling.resolve(radioControlVariants, {
    invalid: isInvalid,
  });
  return (
    <RadioControl
      className={{
        ...classNames,
        field: defaults.field(),
        wrapper: defaults.wrapper(),
        control: styling.cn(defaults.control(), classNames.control),
        labelWrapper: styling.cn(
          defaults.labelWrapper(),
          classNames.labelWrapper,
        ),
        label: styling.cn(defaults.label(), classNames.label),
      }}
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
