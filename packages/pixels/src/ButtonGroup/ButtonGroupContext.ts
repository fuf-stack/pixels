import type { ButtonGroupProps } from './ButtonGroup';

import { createContext } from 'react';

/** Defaults shared with the group's button descendants */
type ButtonGroupContextValue = Pick<
  ButtonGroupProps,
  | 'color'
  | 'disableAnimation'
  | 'disableRipple'
  | 'fullWidth'
  | 'isDisabled'
  | 'isIconOnly'
  | 'radius'
  | 'size'
  | 'variant'
>;

const ButtonGroupContext = createContext<ButtonGroupContextValue | undefined>(
  undefined,
);

export default ButtonGroupContext;
