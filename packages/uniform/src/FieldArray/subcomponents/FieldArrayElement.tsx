import type { Variants as MotionVariants } from '@fuf-stack/pixel-motion';
import type { ClassValue } from '@fuf-stack/pixel-utils';
import type { FieldArrayElementMethods } from '../../hooks/useUniformFieldArray/types';
import type { FieldArrayFeatures } from '../types';

import { useState } from 'react';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { AnimatePresence, motion } from '@fuf-stack/pixel-motion';
import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import Grid from '../../Grid';
import ElementActionsMenu from './ElementActionsMenu';
import ElementRemoveButton from './ElementRemoveButton';
import SortDragHandle from './SortDragHandle';

export type { FieldArrayElementMethods } from '../../hooks/useUniformFieldArray/types';

interface FieldArrayElementProps extends FieldArrayFeatures {
  /** Form elements to render inside array element */
  children: React.ReactNode;
  /** CSS class name */
  className: {
    /** Class of wrapper grid inside the li that wraps the rendered element fields directly */
    elementFieldsGrid?: ClassValue;
    /** Class for the li (performs motion animations) */
    listItem?: ClassValue;
    /** Class for the li inner div (wraps the rendered element fields) */
    listItemInner?: ClassValue;
    /** Class for the actions menu button */
    actionsMenuButton?: ClassValue;
    /** Class for the remove element button (when menu is not used) */
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
  /** HTML data-testid attribute for e2e tests */
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
  duplicate = false,
  elementMarginBottom: _elementMarginBottom = undefined,
  fields,
  id,
  index: _index,
  insertAfter = false,
  lastNotDeletable = true,
  methods,
  sortable = false,
  testId = undefined,
}: FieldArrayElementProps) => {
  const { cn } = useStyling();
  const { setNodeRef, transform, transition, isDragging } = useSortable({ id });
  // keep the row mounted until its exit animation finishes
  const [isVisible, setIsVisible] = useState(true);

  // apply drag positioning only when sorting is enabled
  const sortingStyle = sortable
    ? {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
      }
    : undefined;

  // animate row insertion and removal
  const listItemMotionVariants: MotionVariants = {
    hidden: { opacity: 0, height: 0, marginBottom: 0 },
    visible: {
      opacity: 1,
      height: 'auto',
      transition: { duration: 0.2, ease: 'circOut' },
      // push last visible item down to overlap with append button (hide double border)
      marginBottom: '-1px',
    },
    exit: {
      opacity: 0,
      height: 0,
      marginBottom: 0,
      transition: {
        // on exit first fade out, then shrink
        opacity: { duration: 0.1, ease: 'circOut' },
        height: { delay: 0.1, duration: 0.2, ease: 'circOut' },
      },
    },
  };

  // let the exit animation finish before removing the registered row
  const handleRemove = () => {
    if (disableAnimation) {
      methods.remove();
    } else {
      setIsVisible(false);
    }
  };

  return (
    <AnimatePresence
      mode="wait"
      // remove from RHF state after exit animation
      onExitComplete={methods.remove}
    >
      {isVisible ? (
        <motion.li
          key={id}
          ref={setNodeRef}
          animate={disableAnimation ? undefined : 'visible'}
          className={cn(className.listItem)}
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

            {/** actions menu when duplicate or insertAfter is enabled */}
            {duplicate || insertAfter ? (
              <ElementActionsMenu
                className={className.actionsMenuButton}
                duplicate={duplicate}
                insertAfter={insertAfter}
                methods={{
                  ...methods,
                  remove: handleRemove,
                }}
                showRemove={!(lastNotDeletable && fields.length === 1)}
                testId={`${testId}_actions_menu`}
              />
            ) : (
              <>
                {/** remove element button (when menu is not used) */}
                <AnimatePresence initial={false}>
                  {lastNotDeletable && fields.length === 1 ? null : (
                    <ElementRemoveButton
                      key="remove-button"
                      className={className.removeButton}
                      disableAnimation={disableAnimation}
                      onClick={handleRemove}
                      testId={`${testId}_remove_button`}
                    />
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        </motion.li>
      ) : null}
    </AnimatePresence>
  );
};

export default FieldArrayElement;
