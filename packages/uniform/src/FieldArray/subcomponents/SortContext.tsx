/* eslint-disable react/jsx-props-no-spreading */

import type { DragEndEvent } from '@dnd-kit/core';
import type { ReactNode } from 'react';
import type { UseFieldArrayMove } from 'react-hook-form';

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
  /** enable/disable sorting functionality */
  sortable: boolean;
  /** Array of objects containing unique IDs for sortable items */
  fields: Record<'id', string>[];
  /** react-hook-form's move function to update field array indices */
  move: UseFieldArrayMove;
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
  sortable,
  fields,
  move,
}: SortContextProps) => {
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
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over?.id);
      // Update the field array order using react-hook-form's move function
      move(oldIndex, newIndex);
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
        items={fields.map((field) => field.id)}
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
    </DndContext>
  );
};

export default SortContext;
