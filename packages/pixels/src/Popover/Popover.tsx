import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { PopoverProps as HeroPopoverProps } from '@heroui/popover';
import type { ReactNode } from 'react';
import type { ButtonProps } from '../Button';

import { Button } from '@heroui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import ScrollShadow from '../ScrollShadow/ScrollShadow';

// popover styling variants
export const popoverVariants = tv({
  slots: {
    body: 'möp w-full px-4 py-2',
    content: 'flex max-h-[80vh] flex-col p-0',
    footer: 'w-full px-4 py-2',
    footerWrapper: 'w-full',
    footerDivider: 'm-0 w-full p-0',
    header: 'w-full px-4 pb-1 pt-2 text-lg font-semibold',
    headerWrapper: 'w-full',
    headerDivider: 'm-0 w-full p-0',
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
  placement?: HeroPopoverProps['placement'];
  /** The container element in which the overlay portal will be placed. */
  portalContainer?: HeroPopoverProps['portalContainer'];
  /** Whether to block scrolling outside the popover */
  shouldBlockScroll?: boolean;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
  /** Popover title */
  title?: ReactNode;
  /** When defined a Button will be rendered as trigger (with provided props) instead of unstyled html button */
  triggerButtonProps?: Pick<
    ButtonProps,
    | 'ariaLabel'
    | 'className'
    | 'color'
    | 'disableAnimation'
    | 'disabled'
    | 'size'
    | 'testId'
    | 'variant'
  >;
}

/**
 * Popover component based on [HeroUI Card](https://www.heroui.com//docs/components/popover)
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
  triggerButtonProps = undefined,
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
        {triggerButtonProps ? (
          // TODO: currently we have to use @heroui/button because
          // passing ref does not work (even with forwardRef in Button)
          // eslint-disable-next-line react/jsx-props-no-spreading
          <Button className={className.trigger} {...triggerButtonProps}>
            {children}
          </Button>
        ) : (
          //  eslint-disable-next-line react/button-has-type
          <button className={className.trigger}>{children}</button>
        )}
      </PopoverTrigger>
      <PopoverContent data-testid={contentTestId}>
        {title && (
          <div className={className.headerWrapper}>
            <div className={className.header}>{title}</div>
            <hr className={className.headerDivider} />
          </div>
        )}
        <ScrollShadow className={className.body}>{content}</ScrollShadow>
        {footer && (
          <div className={className.footerWrapper}>
            <hr className={className.footerDivider} />
            <div className={className.footer}>{footer}</div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
