import type { ComponentProps, ReactNode } from 'react';

import { isValidElement } from 'react';
import { Focusable } from 'react-aria-components';

import TooltipTextTrigger from './TooltipTextTrigger';

interface TooltipTriggerElementProps {
  /** Trigger content, use a focusable child for keyboard access */
  children: ReactNode;
  /** CSS class name */
  className: string;
}

/**
 * Connects a focusable child or plain-text wrapper to TooltipTrigger
 *
 * @see https://react-aria.adobe.com/Tooltip
 */
const TooltipTriggerElement = ({
  children,
  className,
}: TooltipTriggerElementProps) => {
  if (isValidElement(children)) {
    return (
      <span className={className}>
        <Focusable>
          {children as ComponentProps<typeof Focusable>['children']}
        </Focusable>
      </span>
    );
  }

  return (
    <TooltipTextTrigger className={className}>{children}</TooltipTextTrigger>
  );
};

export default TooltipTriggerElement;
