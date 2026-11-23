import type { ComponentProps, ReactElement, ReactNode } from 'react';

import { isValidElement } from 'react';
import { Focusable } from 'react-aria-components';

import TooltipTextTrigger from './TooltipTextTrigger';

const INTERACTIVE_TAGS = new Set([
  'a',
  'button',
  'input',
  'select',
  'summary',
  'textarea',
]);

const INTERACTIVE_ROLES = new Set([
  'button',
  'checkbox',
  'combobox',
  'link',
  'menuitem',
  'option',
  'radio',
  'slider',
  'spinbutton',
  'switch',
  'tab',
  'textbox',
]);

const FORWARD_REF = Symbol.for('react.forward_ref');
const MEMO = Symbol.for('react.memo');

/** Whether a component type forwards its ref, also through memo */
const forwardsRef = (type: unknown): boolean => {
  if (typeof type !== 'object' || type === null) {
    return false;
  }
  const { $$typeof, type: inner } = type as {
    $$typeof?: symbol;
    type?: unknown;
  };
  if ($$typeof === FORWARD_REF) {
    return true;
  }
  return $$typeof === MEMO && forwardsRef(inner);
};

/**
 * Whether Focusable can connect a child as tooltip trigger
 *
 * Interactive DOM elements and components that forward their ref receive the
 * trigger props, so focus opens the tooltip and the control references it.
 * Other content only needs hover and keeps the wrapper.
 */
export const isFocusableTrigger = (child: ReactElement): boolean => {
  if (typeof child.type !== 'string') {
    return forwardsRef(child.type);
  }
  const { role, tabIndex } = child.props as {
    role?: string;
    tabIndex?: number;
  };
  return (
    INTERACTIVE_TAGS.has(child.type) ||
    (role !== undefined && INTERACTIVE_ROLES.has(role)) ||
    (tabIndex !== undefined && tabIndex >= 0)
  );
};

interface TooltipTriggerElementProps {
  /** Trigger content, use a focusable child for keyboard access */
  children: ReactNode;
  /** CSS class name */
  className: string;
}

/**
 * Connects a focusable child, or a hover wrapper around other content, to
 * TooltipTrigger
 *
 * @see https://react-aria.adobe.com/Tooltip
 */
const TooltipTriggerElement = ({
  children,
  className,
}: TooltipTriggerElementProps) => {
  if (isValidElement(children) && isFocusableTrigger(children)) {
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
