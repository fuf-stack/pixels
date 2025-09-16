import type { ClassValue } from '@fuf-stack/pixel-utils';
import type { FieldArrayFeatures } from '../types';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { cn } from '@fuf-stack/pixel-utils';

import { Grid } from '../../Grid';
import { useFormContext, useInput } from '../../hooks';
import { FieldValidationError } from '../../partials/FieldValidationError';
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
  /** Base field name for form context */
  arrayFieldName: string;
  /** Form elements to render inside array element */
  children: React.ReactNode;
  /** CSS class names for component parts */
  className: {
    /** Class of wrapper div inside the li that wraps the rendered element fields directly */
    elementWrapper?: ClassValue;
    /** Class for the li */
    listItem?: ClassValue;
    /** Class for the insert button between elements */
    insertAfterButton?: ClassValue;
    /** Class for the remove element button */
    removeButton?: ClassValue;
    /** Class for the drag handle when sorting enabled */
    sortDragHandle?: ClassValue;
  };
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
 * and validation capabilities
 */
const FieldArrayElement = ({
  arrayFieldName,
  children,
  className,
  fields,
  id,
  index,
  insertAfter = false,
  lastNotDeletable = true,
  methods,
  sortable = false,
  testId = undefined,
}: FieldArrayElementProps) => {
  const { getFieldState } = useFormContext();
  const { error, invalid } = getFieldState(arrayFieldName, undefined);

  // TODO: what about input props? and label props? Do we need a label?
  const { getHelperWrapperProps, getErrorMessageProps } = useInput({
    classNames: { helperWrapper: 'block' },
    errorMessage: JSON.stringify(error),
    isInvalid: invalid,
    labelPlacement: 'inside',
    placeholder: ' ',
  });

  // Apply transform styles when sortable is enabled for smooth drag animations
  // transform: handles the item's position during drag
  // transition: controls the animation timing when dropping
  const { setNodeRef, transform, transition } = useSortable({ id });
  const sortingStyle = sortable
    ? {
        transform: CSS.Translate.toString(transform),
        transition,
      }
    : undefined;

  return (
    <>
      <li
        ref={setNodeRef}
        className={cn(className.listItem)}
        style={sortingStyle}
      >
        {/** sorting drag handle */}
        {sortable ? (
          <SortDragHandle
            className={className.sortDragHandle}
            id={id}
            testId={`${testId}_sort_drag_handle`}
          />
        ) : null}

        {/** render element fields */}
        <div
          className={cn(className.elementWrapper)}
          data-testid={`${testId}_element_wrapper`}
        >
          {/* TODO: this has to be improved */}
          <Grid>{children}</Grid>
        </div>

        {/** remove element */}
        {lastNotDeletable && fields.length === 1 ? null : (
          <ElementRemoveButton
            className={className.removeButton}
            testId={`${testId}_remove_button`}
            onClick={() => {
              methods.remove();
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
      </li>

      {/** element error */}
      {typeof error?.[index] !== 'undefined' && (
        <div {...getHelperWrapperProps()}>
          <div {...getErrorMessageProps()}>
            <FieldValidationError
              /* @ts-expect-error rhf incompatibility */
              error={error[Number(index)]?._errors}
              testId={testId as string}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default FieldArrayElement;
