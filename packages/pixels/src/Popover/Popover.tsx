import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { PopoverProps as NextPopoverProps } from '@nextui-org/popover';
import type { ReactNode } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@nextui-org/popover';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import ScrollShadow from '../ScrollShadow/ScrollShadow';

// popover styling variants
export const popoverVariants = tv({
  slots: {
    body: 'w-full px-2.5 py-1',
    content: 'flex max-h-[80vh] w-[400px] flex-col p-0',
    footer: 'w-full px-2.5 py-1',
    header: 'w-full px-2.5 py-1',
    trigger: '',
  },
});

type VariantProps = TVProps<typeof popoverVariants>;
type ClassName = TVClassName<typeof popoverVariants>;

export interface PopoverProps extends VariantProps {
  /** child components */
  children?: ReactNode;
  /** CSS class name */
  className?: ClassName;
  /** content of the popover */
  content: ReactNode;
  /** HTML data-testid attribute used in e2e tests */
  contentTestId?: string;
  /** popover footer */
  footer?: ReactNode;
  /** use as controlled component  */
  openControlled?: { open: boolean; setOpen: (open: boolean) => void };
  /** placement of the popover relative to its trigger reference */
  placement?: NextPopoverProps['placement'];
  /** The container element in which the overlay portal will be placed. */
  portalContainer?: NextPopoverProps['portalContainer'];
  /** Whether to block scrolling outside the popover */
  shouldBlockScroll?: boolean;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
  /** popover title */
  title?: ReactNode;
}

/**
 * Popover component based on [NextUI Card](https://nextui.org/docs/components/popover)
 */
export default ({
  children = null,
  className: _className = undefined,
  content,
  contentTestId = undefined,
  footer = undefined,
  openControlled = undefined,
  placement = 'top',
  portalContainer = undefined,
  shouldBlockScroll = undefined,
  testId = undefined,
  title = undefined,
}: PopoverProps) => {
  // className from slots
  const variants = popoverVariants();
  const className = variantsToClassNames(variants, _className, 'trigger');

  return (
    <Popover
      classNames={className}
      placement={placement}
      portalContainer={portalContainer}
      radius="sm"
      shouldBlockScroll={shouldBlockScroll}
      showArrow
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...(openControlled
        ? { isOpen: openControlled.open, onOpenChange: openControlled.setOpen }
        : {})}
    >
      <PopoverTrigger data-testid={testId}>
        {/* NOTE: type and aria properties are injected by PopoverTrigger */}
        {/* eslint-disable-next-line react/button-has-type */}
        <button>{children}</button>
      </PopoverTrigger>
      <PopoverContent data-testid={contentTestId}>
        {title && (
          <div className={className.header}>
            {title}
            <hr />
          </div>
        )}
        <ScrollShadow className={className.body}>{content}</ScrollShadow>
        {footer && (
          <div className={className.footer}>
            <hr />
            {footer}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
