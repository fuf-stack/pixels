import type { PopoverProps } from '../Popover';

import { Button as AriaButton, ButtonContext } from 'react-aria-components';

import { Button } from '../../Button';
import ButtonGroupContext from '../../ButtonGroup/ButtonGroupContext';
import { useStyling } from '../../StylingProvider';
import { popoverTriggerVariants } from '../popoverVariants';

interface PopoverTriggerProps extends Pick<
  PopoverProps,
  'children' | 'testId' | 'triggerButtonProps'
> {
  /** CSS class name */
  className: string;
}

const triggerContext = { 'aria-haspopup': 'dialog' as const };

/**
 * Plain or styled button connected to the surrounding DialogTrigger
 *
 * @see https://react-aria.adobe.com/Dialog
 * @see https://react-aria.adobe.com/Button
 */
const PopoverTrigger = ({
  children = null,
  className,
  testId = undefined,
  triggerButtonProps = undefined,
}: PopoverTriggerProps) => {
  const styling = useStyling();

  // className from the styled trigger recipe
  const buttonClassName = styling.resolve(popoverTriggerVariants, {
    ...triggerButtonProps,
    className: [className, triggerButtonProps?.className],
    isDisabled: triggerButtonProps?.disabled,
  });

  if (triggerButtonProps) {
    // popover triggers keep independent defaults inside a ButtonGroup
    return (
      <ButtonGroupContext.Provider value={undefined}>
        <ButtonContext.Provider value={triggerContext}>
          <Button
            {...triggerButtonProps}
            ariaLabel={triggerButtonProps['aria-label']}
            className={buttonClassName}
            dataSlot="trigger"
            ripple
            testId={testId}
          >
            {children}
          </Button>
        </ButtonContext.Provider>
      </ButtonGroupContext.Provider>
    );
  }

  return (
    <AriaButton
      aria-haspopup="dialog"
      className={className}
      data-slot="trigger"
      data-testid={testId}
    >
      {children}
    </AriaButton>
  );
};

export default PopoverTrigger;
