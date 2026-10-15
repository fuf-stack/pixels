import type { TVClassName } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';

import { tv } from '@fuf-stack/pixel-utils';
import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import {
  RadioControl,
  radioControlVariants,
} from '../partials/RadioLayout/RadioLayout';

export const radioBoxVariants = tv({
  slots: {
    base: 'group inline-flex flex-auto cursor-pointer items-center justify-between gap-4 rounded-lg border-2 border-default p-4 hover:bg-content2 data-[selected=true]:border-focus',
    control: '',
    description: 'text-foreground opacity-70 text-small',
    icon: '',
    label: '',
    labelWrapper: 'grow',
  },
  variants: {
    isDisabled: {
      true: {
        base: 'pointer-events-none opacity-disabled',
      },
    },
    isInvalid: {
      true: {
        base: '!border-danger',
      },
    },
  },
});

type ClassName = TVClassName<typeof radioBoxVariants>;

export interface RadioBoxProps {
  /** Option label. */
  children?: ReactNode;
  /** Option description. */
  description?: ReactNode;
  /** Whether the option is disabled. */
  isDisabled?: boolean;
  /** String value managed by the containing radio group. */
  value: string;
  /** HTML test ID for the option. */
  'data-testid'?: string;
  /** Slot classes passed by RadioBoxes. */
  classNames?: ClassName;
  /** CSS class name */
  className?: ClassName;
  /** icon for the option */
  icon?: ReactNode;
  /** whether the radio is invalid */
  isInvalid?: boolean;
}

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
  const classes = styling.variantsToClassNames(
    styling.resolve(radioBoxVariants, { isDisabled, isInvalid }),
    _classNames ?? className,
    'base',
  );
  const defaults = styling.resolve(radioControlVariants, {
    invalid: isInvalid,
  });
  return (
    <RadioControl
      classes={{
        ...classes,
        wrapper: defaults.wrapper(),
        control: styling.cn(defaults.control(), classes.control),
        labelWrapper: styling.cn(defaults.labelWrapper(), classes.labelWrapper),
        label: styling.cn(defaults.label(), classes.label),
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
