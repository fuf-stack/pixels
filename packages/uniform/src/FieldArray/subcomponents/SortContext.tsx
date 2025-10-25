import type { DragEndEvent } from '@dnd-kit/core';
import type { ReactNode } from 'react';
import type { UseFieldArrayMove } from 'react-hook-form';

import { useFormContext } from 'react-hook-form';

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface SortContextProps {
  /** child components */
  children: ReactNode;
  /** Array of objects containing unique IDs for sortable items */
  fields: Record<'id', string>[];
  /** name of the field array */
  name: string;
  /** react-hook-form's move function to update field array indices */
  move: UseFieldArrayMove;
  /** enable/disable sorting functionality */
  sortable: boolean;
}

/**
 * A wrapper component that provides drag-and-drop sorting functionality for field arrays
 * using dnd-kit and react-hook-form.
 *
 * This component integrates with react-hook-form's field arrays to enable vertical
 * drag-and-drop reordering of form fields. It supports both pointer (mouse/touch)
 * and keyboard interactions for accessibility.
 */
const SortContext = ({
  children,
  fields,
  move,
  name,
  sortable,
}: SortContextProps): ReactNode => {
  const { trigger } = useFormContext();

  // Initialize sensors for both pointer (mouse/touch) and keyboard interactions
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor),
  );

  // Early return if sorting is disabled
  if (!sortable) {
    return children;
  }

  /**
   * Handles the end of a drag operation by updating field positions
   * @param event - The drag end event containing active and over elements
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Only move if dropping over a different item
    if (active.id !== over?.id) {
      // Find the indices of the dragged item and drop target
      const oldIndex = fields.findIndex((field) => {
        return field.id === active.id;
      });
      const newIndex = fields.findIndex((field) => {
        return field.id === over?.id;
      });
      // Update the field array order using react-hook-form's move function
      move(oldIndex, newIndex);

      // Finally trigger validation for the array field,
      // so validation errors are updated for the new order
      trigger(name);
    }
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <SortableContext
        strategy={verticalListSortingStrategy}
        items={fields.map((field) => {
          return field.id;
        })}
      >
        {children}
      </SortableContext>
    </DndContext>
  );
};

export default SortContext;
