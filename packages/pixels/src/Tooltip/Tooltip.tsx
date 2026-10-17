import type { ReactNode } from 'react';
import type { ClassName, VariantProps } from './tooltipVariants';

import { TooltipTrigger } from 'react-aria-components';

import { useStyling } from '../StylingProvider';
import TooltipOverlay from './subcomponents/TooltipOverlay';
import TooltipTriggerElement from './subcomponents/TooltipTriggerElement';
import { tooltipVariants } from './tooltipVariants';

export { tooltipVariants } from './tooltipVariants';

export type TooltipPlacement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end'
  | 'left-start'
  | 'left-end'
  | 'right-start'
  | 'right-end';

export interface TooltipProps {
  /** Content that opens the tooltip on hover or focus */
  children: ReactNode;
  /** CSS class name */
  className?: ClassName;
  /** Delay in milliseconds before closing the tooltip */
  closeDelay?: number;
  /** Minimum space from the viewport edge in pixels */
  containerPadding?: number;
  /** Tooltip body content */
  content: ReactNode;
  /** Opens the tooltip initially */
  defaultOpen?: boolean;
  /** Delay in milliseconds before opening the tooltip */
  delay?: number;
  /** Content below the tooltip body */
  footer?: ReactNode;
  /** Title above the tooltip body */
  header?: ReactNode;
  /** Callback when visibility changes */
  onOpenChange?: (isOpen: boolean) => void;
  /** Position relative to the trigger */
  placement?: TooltipPlacement;
  /** Maximum width of each content section */
  size?: VariantProps['size'];
}

/** Supporting information shown beside a trigger on hover or focus */
const Tooltip = ({
  children,
  className = undefined,
  closeDelay = 500,
  containerPadding = 0,
  content,
  defaultOpen = false,
  delay = 0,
  footer = undefined,
  header = undefined,
  onOpenChange = undefined,
  placement = 'top',
  size = 'full',
}: TooltipProps) => {
  const styling = useStyling();

  // classNames from slots
  const variants = styling.resolve(tooltipVariants, { size });
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  return (
    <TooltipTrigger
      closeDelay={closeDelay}
      defaultOpen={defaultOpen}
      delay={delay}
      onOpenChange={onOpenChange}
    >
      <TooltipTriggerElement className={classNames.trigger}>
        {children}
      </TooltipTriggerElement>
      <TooltipOverlay
        className={classNames}
        containerPadding={containerPadding}
        content={content}
        footer={footer}
        header={header}
        placement={placement}
      />
    </TooltipTrigger>
  );
};

export default Tooltip;
