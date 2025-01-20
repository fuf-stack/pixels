import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';

import { Tooltip as NextTooltip } from '@heroui/tooltip';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

// tooltip variants
export const tooltipVariants = tv({
  slots: {
    base: '',
    content: '',
    wrapper: 'cursor-pointer',
  },
});

type VariantProps = TVProps<typeof tooltipVariants>;
type ClassName = TVClassName<typeof tooltipVariants>;

export const tooltipPlacementOptions = [
  'top',
  'bottom',
  'left',
  'right',
] as const;
export type TooltipPlacement = (typeof tooltipPlacementOptions)[number];

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
  onOpenChange = undefined,
  placement = 'top',
}: TooltipProps) => {
  // classNames from slots
  const variants = tooltipVariants();
  const classNames = variantsToClassNames(variants, _className, 'base');

  return (
    <NextTooltip
      classNames={classNames}
      closeDelay={closeDelay}
      containerPadding={containerPadding}
      content={content}
      defaultOpen={defaultOpen}
      delay={delay}
      onClick={(e) => e.preventDefault()}
      onOpenChange={onOpenChange}
      placement={placement}
      shouldFlip
      showArrow
    >
      <span className={classNames.wrapper}>{children}</span>
    </NextTooltip>
  );
};

export default Tooltip;
