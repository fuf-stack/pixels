import type { MenuProps } from '../Menu';

import { Button as AriaButton } from 'react-aria-components';

import { Button } from '../../Button';
import ButtonGroupContext from '../../ButtonGroup/ButtonGroupContext';
import { popoverTriggerVariants } from '../../Popover/popoverVariants';
import { useStyling } from '../../StylingProvider';
import VerticalDotsIcon from '../VerticalDotsIcon';

interface MenuTriggerButtonProps extends Pick<
  MenuProps,
  'ariaLabel' | 'children' | 'isDisabled' | 'testId' | 'triggerButtonProps'
> {
  /** CSS class name */
  className: string;
}

/**
 * Plain, styled or icon-only button connected to MenuTrigger
 *
 * @see https://react-aria.adobe.com/Menu
 * @see https://react-aria.adobe.com/Button
 */
const MenuTriggerButton = ({
  ariaLabel = undefined,
  children = null,
  className,
  isDisabled = false,
  testId = undefined,
  triggerButtonProps = undefined,
}: MenuTriggerButtonProps) => {
  const styling = useStyling();

  const iconOnly = !children;
  const {
    'aria-label': buttonLabel,
    'data-testid': buttonTestId,
    dataSlot,
    disableRipple,
    ...buttonProps
  } = triggerButtonProps ?? {};

  // className from the existing styled trigger defaults
  const buttonClassName = styling.resolve(popoverTriggerVariants, {
    ...buttonProps,
    className: iconOnly
      ? ['min-w-0 outline outline-divider', className, buttonProps.className]
      : [className, buttonProps.className],
    isIconOnly: iconOnly,
    radius: iconOnly ? 'full' : undefined,
    size: iconOnly ? 'sm' : buttonProps.size,
    variant: iconOnly ? 'light' : buttonProps.variant,
  });

  if (!iconOnly && !triggerButtonProps) {
    return (
      <AriaButton
        aria-label={ariaLabel}
        className={className}
        data-slot="trigger"
        data-testid={testId}
        isDisabled={isDisabled}
      >
        {children}
      </AriaButton>
    );
  }

  return (
    <ButtonGroupContext.Provider value={undefined}>
      <Button
        {...buttonProps}
        ariaLabel={
          buttonLabel ?? ariaLabel ?? (iconOnly ? 'Open menu' : undefined)
        }
        className={buttonClassName}
        dataSlot={dataSlot ?? 'trigger'}
        disabled={isDisabled || buttonProps.disabled}
        icon={iconOnly ? <VerticalDotsIcon /> : undefined}
        radius={iconOnly ? 'full' : undefined}
        ripple={!disableRipple}
        size={buttonProps.size ?? (iconOnly ? 'sm' : undefined)}
        testId={buttonTestId ?? testId}
        variant={buttonProps.variant ?? (iconOnly ? 'light' : 'solid')}
      >
        {children}
      </Button>
    </ButtonGroupContext.Provider>
  );
};

export default MenuTriggerButton;
