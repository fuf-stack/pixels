import type { ReactNode } from 'react';
import type { ButtonProps } from '../Button';
import type { ClassName } from './popoverVariants';

import { DialogTrigger } from 'react-aria-components';

import { useStyling } from '../StylingProvider';
import { popoverVariants } from './popoverVariants';
import PopoverOverlay from './subcomponents/PopoverOverlay';
import PopoverTrigger from './subcomponents/PopoverTrigger';

export { popoverVariants } from './popoverVariants';

export interface PopoverProps {
  /** Trigger content */
  children?: ReactNode;
  /** CSS class name */
  className?: ClassName;
  /** Popover content */
  content: ReactNode;
  /** HTML data-testid attribute for the dialog */
  contentTestId?: string;
  /** Content below the scrollable body */
  footer?: ReactNode;
  /** Popover title */
  header?: ReactNode;
  /** Controlled visibility and callback when it changes */
  openControlled?: { open: boolean; setOpen: (open: boolean) => void };
  /** Position relative to the trigger, flips when space is limited */
  placement?:
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'left'
    | 'left-start'
    | 'left-end'
    | 'right'
    | 'right-start'
    | 'right-end';
  /** Container for the overlay portal, defaults to document.body */
  portalContainer?: Element;
  /** Prevents page scrolling while the popover is open */
  shouldBlockScroll?: boolean;
  /** HTML data-testid attribute for the trigger */
  testId?: string;
  /** Renders a styled button instead of a plain trigger */
  triggerButtonProps?: Pick<
    ButtonProps,
    'className' | 'color' | 'disableAnimation' | 'disabled' | 'size' | 'variant'
  > & {
    /** Accessible name for the trigger */
    'aria-label'?: string;
  };
}

/** Anchored popup for supporting information or related actions */
const Popover = ({
  children = null,
  className = undefined,
  content,
  contentTestId = undefined,
  footer = undefined,
  header = undefined,
  openControlled = undefined,
  placement = 'top',
  portalContainer = undefined,
  shouldBlockScroll = false,
  testId = undefined,
  triggerButtonProps = undefined,
}: PopoverProps) => {
  const styling = useStyling();

  // classNames from slots
  const variants = styling.resolve(popoverVariants);
  const classNames = styling.variantsToClassNames(
    variants,
    className,
    'trigger',
  );

  return (
    <DialogTrigger
      isOpen={openControlled?.open}
      onOpenChange={openControlled?.setOpen}
    >
      <PopoverTrigger
        className={classNames.trigger}
        testId={testId}
        triggerButtonProps={triggerButtonProps}
      >
        {children}
      </PopoverTrigger>

      <PopoverOverlay
        className={classNames}
        content={content}
        contentTestId={contentTestId}
        footer={footer}
        header={header}
        placement={placement}
        portalContainer={portalContainer}
        shouldBlockScroll={shouldBlockScroll}
      />
    </DialogTrigger>
  );
};

export default Popover;
