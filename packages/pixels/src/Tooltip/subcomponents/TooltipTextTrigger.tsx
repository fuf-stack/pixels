import type { ReactNode } from 'react';

import { useRef } from 'react';
import { useFocusable } from 'react-aria';

interface TooltipTextTriggerProps {
  /** Non-focusable trigger content */
  children: ReactNode;
  /** CSS class name */
  className: string;
}

/**
 * Hover bridge for the existing plain-text trigger wrapper
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
