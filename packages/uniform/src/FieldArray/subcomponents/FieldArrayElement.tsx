import type { Variants as MotionVariants } from '@fuf-stack/pixel-motion';
import type { ClassValue } from '@fuf-stack/pixel-utils';
import type { FieldArrayFeatures } from '../types';

import { useState } from 'react';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { AnimatePresence, motion } from '@fuf-stack/pixel-motion';
import { cn } from '@fuf-stack/pixel-utils';

import { Grid } from '../../Grid';
import ElementInsertAfterButton from './ElementInsertAfterButton';
import ElementRemoveButton from './ElementRemoveButton';
import SortDragHandle from './SortDragHandle';

export interface FieldArrayElementMethods {
  /** Add new element at end */
  append: () => void;
  /** Clone current element */
  duplicate: () => void;
  /** Add new element after current */
  insert: () => void;
  /** Remove current element */
  remove: () => void;
}

interface FieldArrayElementProps extends FieldArrayFeatures {
  /** Form elements to render inside array element */
  children: React.ReactNode;
  /** CSS class names for component parts */
  className: {
    /** Class of wrapper grid inside the li that wraps the rendered element fields directly */
    elementFieldsGrid?: ClassValue;
    /** Class for the li (performs motion animations) */
    listItem?: ClassValue;
    /** Class for the li inner div (wraps the rendered element fields) */
    listItemInner?: ClassValue;
    /** Class for the insert button between elements */
    insertAfterButton?: ClassValue;
    /** Class for the remove element button */
    removeButton?: ClassValue;
    /** Class for the drag handle when sorting enabled */
    sortDragHandle?: ClassValue;
  };
  /** Globally disable animations for this item (used for first render or prefers-reduced-motion) */
  disableAnimation?: boolean;
  /** Bottom margin for elements (for backwards compatibility) */
  elementMarginBottom?: React.CSSProperties['marginBottom'];
  /** All fields in the form array */
  fields: Record<'id', string>[];
  /** Unique identifier for drag/drop */
  id: string | number;
  /** Field index in array */
  index: number;
  /** Prevent deletion of last remaining element */
  lastNotDeletable?: boolean;
  /** Field array operation methods */
  methods: FieldArrayElementMethods;
  /** HTML data-testid of the element */
  testId?: string;
}

/**
 * Form array element component using react-hook-form with drag-drop sorting
 * and validation capabilities. Animations when elements are added or removed
 * improve the user experience and provide a better visual feedback.
 */
const FieldArrayElement = ({
  children,
  className,
  disableAnimation = false,
  elementMarginBottom: _elementMarginBottom = undefined,
  fields,
  id,
  index,
  insertAfter = false,
  lastNotDeletable = true,
  methods,
  sortable = false,
  testId = undefined,
}: FieldArrayElementProps) => {
  // Apply transform styles when sortable is enabled for smooth drag animations
  // transform: handles the item's position during drag
  // transition: controls the animation timing when dropping
  const { setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const sortingStyle = sortable
    ? {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
      }
    : undefined;

  // Local visibility to allow exit animation before removing from RHF state
  const [isVisible, setIsVisible] = useState(true);

  // Motion variants for the list item
  const listItemMotionVariants: MotionVariants = {
    hidden: { opacity: 0, height: 0, marginBottom: 0 },
    visible: {
      opacity: 1,
      height: 'auto',
      transition: { duration: 0.2, ease: 'circOut' },
    },
    exit: {
      opacity: 0,
      height: 0,
      marginBottom: 0,
      transition: {
        // on exit first fade out, then shrink
        opacity: { duration: 0.1, ease: 'circOut' },
        height: { delay: 0.1, duration: 0.2, ease: 'circOut' },
        marginBottom: { delay: 0.1, duration: 0.2, ease: 'circOut' },
      },
    },
  };

  // Height animation handled on <motion.li> using overflow hidden
  return (
    <AnimatePresence
      mode="wait"
      // remove from RHF state after exit animation
      onExitComplete={() => {
        methods.remove();
      }}
    >
      {isVisible ? (
        <motion.li
          key={id}
          ref={setNodeRef}
          animate={disableAnimation ? undefined : 'visible'}
          className={cn(className.listItem, 'group')}
          data-dragging={isDragging}
          data-testid={`${testId}_element`}
          exit={disableAnimation ? undefined : 'exit'}
          initial={disableAnimation ? false : 'hidden'}
          style={sortingStyle}
          variants={disableAnimation ? undefined : listItemMotionVariants}
        >
          <div className={cn(className.listItemInner)}>
            {/** sorting drag handle */}
            {sortable ? (
              <SortDragHandle
                className={className.sortDragHandle}
                id={id}
                testId={`${testId}_sort_drag_handle`}
              />
            ) : null}

            {/** render element fields in Grid component */}
            <Grid
              className={cn(className.elementFieldsGrid)}
              testId={`${testId}_element_fields_grid`}
            >
              {/* render actual fields */}
              {children}
            </Grid>

            {/** remove element */}
            {lastNotDeletable && fields.length === 1 ? null : (
              <ElementRemoveButton
                className={className.removeButton}
                testId={`${testId}_remove_button`}
                onClick={() => {
                  if (disableAnimation) {
                    methods.remove();
                  } else {
                    setIsVisible(false);
                  }
                }}
              />
            )}

            {/** insertAfter feature when not last element */}
            {insertAfter && index !== fields.length - 1 ? (
              <ElementInsertAfterButton
                className={className.insertAfterButton}
                testId={`${testId}_insert_after_button`}
                onClick={() => {
                  methods.insert();
                }}
              />
            ) : null}
          </div>
        </motion.li>
      ) : null}
    </AnimatePresence>
  );
};

export default FieldArrayElement;
