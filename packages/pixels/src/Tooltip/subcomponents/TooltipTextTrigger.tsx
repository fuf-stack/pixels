import type { ReactNode } from 'react';

import { useRef } from 'react';
import { useFocusable } from 'react-aria';

interface TooltipTextTriggerProps {
  /** Text or other non-interactive trigger content */
  children: ReactNode;
  /** CSS class name */
  className: string;
}

/**
 * Hover wrapper for text and non-interactive trigger content
 *
 * Components such as labels or icons often neither forward a ref nor have an
 * interactive role, so the wrapper receives the hover props instead
 *
 * @see https://react-aria.adobe.com/Tooltip
 */
const TooltipTextTrigger = ({
  children,
  className,
}: TooltipTextTriggerProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const { focusableProps } = useFocusable({}, ref);

  return (
    <span
      {...focusableProps}
      ref={ref}
      className={className}
      tabIndex={undefined}
    >
      {children}
    </span>
  );
};

export default TooltipTextTrigger;
