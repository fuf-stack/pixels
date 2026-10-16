import type { ClassValue } from '@fuf-stack/pixel-utils';

import { FaGripVertical } from 'react-icons/fa';

import { useSortable } from '@dnd-kit/sortable';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

interface SortDragHandleProps {
  /** CSS class name */
  className?: ClassValue;
  /** Unique identifier for sortable item */
  id: string | number;
  /** HTML data-testid attribute for e2e tests */
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
  const { cn } = useStyling();
  const { attributes, listeners } = useSortable({ id });

  return (
    <div
      className={cn(className)}
      data-testid={testId}
      {...attributes}
      {...listeners}
      aria-label="Reorder item"
    >
      <FaGripVertical />
    </div>
  );
};

export default SortDragHandle;
