import type { ClassValue } from '@fuf-stack/pixel-utils';
import type { MenuItem } from '@fuf-stack/pixels';
import type { Key } from 'react';
import type { FieldArrayElementMethods } from './FieldArrayElement';

import { FaCopy, FaTimes } from 'react-icons/fa';
import { VscInsert } from 'react-icons/vsc';

import { cn } from '@fuf-stack/pixel-utils';
import { Menu } from '@fuf-stack/pixels';

export interface ElementActionsMenuProps {
  /** CSS class name */
  className?: ClassValue;
  /** Whether duplicate action is available */
  duplicate?: boolean;
  /** Whether insert after action is available */
  insertAfter?: boolean;
  /** Whether to show remove button (false when last element is not deletable) */
  showRemove?: boolean;
  /** Field array operation methods */
  methods: FieldArrayElementMethods;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
}

/**
 * Menu component for field array element actions (remove, duplicate, insert after)
 */
const ElementActionsMenu = ({
  className = undefined,
  duplicate = false,
  insertAfter = false,
  showRemove = true,
  methods,
  testId = undefined,
}: ElementActionsMenuProps) => {
  const handleAction = (key: Key) => {
    switch (key) {
      case 'remove':
        methods.remove();
        break;
      case 'duplicate':
        methods.duplicate();
        break;
      case 'insertAfter':
        methods.insert();
        break;
      default:
        break;
    }
  };

  // Build menu items based on available actions
  const menuItems: MenuItem[] = [];

  if (duplicate) {
    menuItems.push({
      key: 'duplicate',
      label: 'Duplicate',
      icon: <FaCopy />,
    });
  }

  if (insertAfter) {
    menuItems.push({
      key: 'insertAfter',
      label: 'Insert After',
      icon: <VscInsert />,
    });
  }

  if (showRemove) {
    menuItems.push({
      key: 'remove',
      className: 'text-danger',
      label: 'Remove',
      icon: <FaTimes />,
    });
  }

  return (
    <Menu
      ariaLabel="Element actions"
      items={menuItems}
      onAction={handleAction}
      placement="right"
      testId={testId}
      triggerButtonProps={{
        className: cn(className),
        disableRipple: true,
        size: 'md',
        variant: 'light',
      }}
    />
  );
};

export default ElementActionsMenu;
