import type { ClassValue } from '@fuf-stack/pixel-utils';

import { FaGripVertical } from 'react-icons/fa';

import { useSortable } from '@dnd-kit/sortable';

import { cn } from '@fuf-stack/pixel-utils';

interface SortDragHandleProps {
  /** Optional CSS class name */
  className?: ClassValue;
  /** Unique identifier for sortable item */
  id: string | number;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
}

/**
 * Drag handle component that integrates with dnd-kit sortable functionality.
 * Renders a vertical grip icon that can be used to reorder items.
 */
const SortDragHandle = ({
  className = undefined,
  id,
  testId = undefined,
}: SortDragHandleProps) => {
  // Get dnd-kit sortable attributes and listeners
  const { attributes, listeners } = useSortable({ id });

  return (
    <div
      className={cn(className)}
      data-testid={testId}
      {...attributes}
      {...listeners}
    >
      <FaGripVertical />
    </div>
  );
};

export default SortDragHandle;
