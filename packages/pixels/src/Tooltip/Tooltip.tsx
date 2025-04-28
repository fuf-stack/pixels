import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { TooltipPlacement as HeroTooltipPlacement } from '@heroui/tooltip';
import type { ReactNode } from 'react';

import { Tooltip as HeroTooltip } from '@heroui/tooltip';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import ScrollShadow from '../ScrollShadow/ScrollShadow';

// tooltip variants
export const tooltipVariants = tv({
  slots: {
    base: '',
    body: 'w-full px-4 py-2',
    content: 'flex max-h-[80vh] flex-col p-0',
    divider: 'm-0 w-full p-0',
    footer: 'w-full px-4 py-2',
    footerWrapper: 'w-full',
    header: 'w-full px-4 pb-1 pt-2 font-semibold',
    headerWrapper: 'w-full',
    wrapper: 'cursor-pointer',
  },
});

type VariantProps = TVProps<typeof tooltipVariants>;
type ClassName = TVClassName<typeof tooltipVariants>;

export type TooltipPlacement = HeroTooltipPlacement;

export interface TooltipProps extends VariantProps {
  /** trigger child components */
  children: ReactNode;
  /** CSS class name */
  className?: ClassName;
  /** delay in milliseconds before the tooltip opens. */
  closeDelay?: number;
  /** delay in milliseconds before the tooltip opens. */
  delay?: number;
  /** placement padding in px */
  containerPadding?: number;
  /** content displayed in the tooltip */
  content: ReactNode;
  /** open overlay initially when uncontrolled */
  defaultOpen?: boolean;
  /** tooltip footer */
  footer?: ReactNode;
  /** tooltip header */
  header?: ReactNode;
  /** handler that is called when the overlay's open state changes */
  onOpenChange?: (isOpen: boolean) => void;
  /** placement if the tooltip */
  placement?: TooltipPlacement;
}

/**
 * Tooltip component based on [HeroUI Tooltip](https://www.heroui.com//docs/components/tooltip)
 */
const Tooltip = ({
  children,
  className: _className = undefined,
  closeDelay = 500,
  containerPadding = 0,
  content,
  defaultOpen = false,
  delay = 0,
  footer = undefined,
  header = undefined,
  onOpenChange = undefined,
  placement = 'top',
}: TooltipProps) => {
  // classNames from slots
  const variants = tooltipVariants();
  const classNames = variantsToClassNames(variants, _className, 'base');

  return (
    <HeroTooltip
      classNames={classNames}
      closeDelay={closeDelay}
      containerPadding={containerPadding}
      content={
        <div>
          {header && (
            <div className={classNames.headerWrapper}>
              <div className={classNames.header}>{header}</div>
              <hr className={classNames.divider} />
            </div>
          )}
          <ScrollShadow className={classNames.body}>{content}</ScrollShadow>
          {footer && (
            <div className={classNames.footerWrapper}>
              <hr className={classNames.divider} />
              <div className={classNames.footer}>{footer}</div>
            </div>
          )}
        </div>
      }
      defaultOpen={defaultOpen}
      delay={delay}
      onClick={(e) => e.preventDefault()}
      onOpenChange={onOpenChange}
      placement={placement}
      shouldFlip
      showArrow
    >
      <span className={classNames.wrapper}>{children}</span>
    </HeroTooltip>
  );
};

export default Tooltip;
