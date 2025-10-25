import type { FieldArrayElementMethods } from './subcomponents/FieldArrayElement';
import type { FieldArrayProps } from './types';

import { useEffect, useRef } from 'react';

import { useReducedMotion } from '@fuf-stack/pixel-motion';
import { cn, tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import { flatArrayKey } from '../helpers';
import { useFieldArray, useUniformField } from '../hooks';
import { useFormContext } from '../hooks/useFormContext/useFormContext';
import ElementAppendButton from './subcomponents/ElementAppendButton';
import FieldArrayElement from './subcomponents/FieldArrayElement';
import FieldArrayLabel from './subcomponents/FieldArrayLabel';
import FieldArrayValidationError from './subcomponents/FieldArrayValidationError';
import SortContext from './subcomponents/SortContext';

export const fieldArrayVariants = tv({
  slots: {
    /** base class for the field array wrapper */
    base: [
      // base styles
      'overflow-hidden rounded-small border border-divider bg-content1',
      // divider between items
      'divide-y divide-divider',
    ],
    /** class for the actions menu button */
    actionsMenuButton: [
      // base styles
      'flex items-center justify-center text-default-600',
      // fixed height/no round corners/center align
      'h-full rounded-none',
      // focus styles - inset ring
      'outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus',
    ],
    /** class for the append button */
    appendButton: [
      // base styles
      'w-full rounded-b-small rounded-t-none',
      // match label height (p-3 = 12px vertical padding + text-base line height)
      '!h-[48px] !min-h-0',
      // focus styles - inset ring with rounded bottom corners to match container
      'outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus',
    ],
    /** class for the element fields grid */
    elementFieldsGrid: ['w-full grow p-3'],
    /** class for the label */
    label: [
      // override HeroUI label positioning and display
      'pointer-events-auto! static! z-auto! block! w-full!',
      // reset any transforms or translations
      'translate-x-0! translate-y-0! transform-none!',
      // card header styling - use text-medium (16px) instead of text-base for correct 48px height
      'rounded-t-small p-3 font-semibold text-medium',
    ],
    /** class for the list */
    list: ['overflow-hidden'],
    /** class for the list wrapper */
    listWrapper: ['overflow-hidden'],
    /** class for the list item (performs motion animations) */
    listItem: [
      // base styles
      'group relative flex flex-row',
      // overlap borders by shifting first item up 1px (similar to how last item overlaps with append button)
      'first:-mt-px',
    ],
    /** class for the list item inner */
    listItemInner: [
      // base styles
      'flex w-full flex-row items-stretch divide-divider bg-content1',
      // x division and borders
      'divide-x divide-solid border-b border-t border-divider',
    ],
    /** class for the remove button */
    removeButton: [
      // base styles
      'flex items-center justify-center',
      // fixed height/no round corners
      '!h-full !min-h-0 !rounded-none px-3',
      // focus styles - inset ring
      'outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus',
    ],
    /** class for the sort drag handle */
    sortDragHandle: [
      // base styles
      'flex cursor-grab items-center justify-center px-2 text-default-600 transition-colors',
      // hover and  dragging state
      'hover:bg-default-100 active:cursor-grabbing group-data-[dragging=true]:bg-default-100',
      // focus styles - inset ring
      'outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus',
    ],
  },
  variants: {
    hasLabel: {
      false: {
        // focus styles - when there is no label, the first item actions menu button should have rounded top right corners
        actionsMenuButton:
          'group-[:first-child]:!rounded-tr-small group-[:first-child]:group-data-[dragging=true]:!rounded-tr-none',
        // focus styles - when there is no label, the first item remove button focus ring should have rounded top right corners
        removeButton:
          'group-[:first-child]:!rounded-tr-small group-[:first-child]:group-data-[dragging=true]:!rounded-tr-none',
        // focus styles - when there is no label, the first item sort drag handle focus ring should have rounded top left corners
        sortDragHandle:
          'group-[:first-child]:rounded-tl-small group-[:first-child]:group-data-[dragging=true]:rounded-tl-none',
      },
    },
  },
});

/**
 * FieldArray component based in [RHF useFieldArray](https://react-hook-form.com/docs/usefieldarray)
 */
const FieldArray = ({
  appendButtonText = 'Add Element',
  children,
  className: _className = undefined,
  duplicate = false,
  elementInitialValue: _elementInitialValue = null,
  elementMarginBottom = undefined,
  flat = false,
  insertAfter = false,
  lastElementNotRemovable = false,
  name,
  sortable = false,
  ...uniformFieldProps
}: FieldArrayProps) => {
  const { control, error, getValues, invalid, testId } = useUniformField({
    name,
    showInvalidWhen: 'immediate',
    ...uniformFieldProps,
  });

  const { fields, append, remove, insert, move } = useFieldArray({
    control,
    name,
  });

  const { trigger, setValue } = useFormContext();

  // Validate array-level constraints immediately when length changes
  useEffect(() => {
    setTimeout(() => {
      // Trigger validation for the array field so max/min errors appear instantly
      trigger(name);
    }, 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields.length]);

  // Prepare initial element value based on mode
  // - flat=true: arrays of primitives → object with flatArrayKey and null value by default
  // - flat=false: arrays of objects → empty object by default
  const elementInitialValue = flat
    ? { [flatArrayKey]: _elementInitialValue ?? null }
    : (_elementInitialValue ?? {});

  // When lastElementNotRemovable is set and the field array is empty,
  // add an initial element to ensure there's always at least one visible element
  useEffect(
    () => {
      if (lastElementNotRemovable && fields.length === 0) {
        // use setValue instead of append to avoid focusing added element
        setValue(name, [elementInitialValue]);
      }
    },
    // only run once when the component mounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Track initial render to prevent animating elements on
  // first render cycle or when user prefers reduced motion
  const prefersReducedMotion = useReducedMotion();
  const disableAnimationRef = useRef(true);
  useEffect(() => {
    if (!prefersReducedMotion) {
      disableAnimationRef.current = false;
    }
  }, [prefersReducedMotion]);

  // className from slots
  const variants = fieldArrayVariants({ hasLabel: !!uniformFieldProps.label });
  const className = variantsToClassNames(variants, _className, 'base');

  return (
    <div className={className.base}>
      {/* field array label */}
      <FieldArrayLabel
        className={className.label}
        label={uniformFieldProps.label}
        name={name}
      />

      {fields.length ? (
        /* list wrapper */
        <div className={cn(className.listWrapper)}>
          {/* sortable context */}
          <SortContext
            fields={fields}
            move={move}
            name={name}
            sortable={sortable}
          >
            {/* list container */}
            <ul className={className.list} data-testid={testId}>
              {/* fields / list elements  */}
              {fields.map((field, index) => {
                const elementName = flat
                  ? `${name}.${index}.${flatArrayKey}`
                  : `${name}.${index}`;
                const elementTestId = `${testId}_${index}`;

                // create methods for element
                const elementMethods: FieldArrayElementMethods = {
                  append: () => {
                    append(elementInitialValue);
                  },
                  duplicate: () => {
                    const values = getValues(name);
                    const currentValue = (values as unknown[])[index];
                    const nextValue = flat
                      ? { [flatArrayKey]: currentValue }
                      : currentValue;
                    insert(index + 1, nextValue);
                  },
                  insert: () => {
                    insert(index + 1, elementInitialValue);
                  },
                  remove: () => {
                    remove(index);
                  },
                };

                return (
                  <FieldArrayElement
                    key={field.id}
                    className={className}
                    disableAnimation={disableAnimationRef.current}
                    duplicate={duplicate}
                    elementMarginBottom={elementMarginBottom}
                    fields={fields}
                    id={field.id}
                    index={index}
                    insertAfter={insertAfter}
                    lastNotDeletable={lastElementNotRemovable}
                    methods={elementMethods}
                    sortable={sortable}
                    testId={elementTestId}
                  >
                    {children({
                      index,
                      length: fields.length,
                      methods: elementMethods,
                      name: elementName,
                      testId: elementTestId,
                    })}
                  </FieldArrayElement>
                );
              })}
            </ul>
          </SortContext>
        </div>
      ) : null}

      {/* append elements button */}
      <ElementAppendButton
        appendButtonText={appendButtonText}
        testId={`${testId}_append_button`}
        className={cn(
          className.appendButton,
          // only round bottom corners if there are no errors below
          // @ts-expect-error - error._errors exists but not typed
          { 'rounded-none': invalid && error?._errors },
        )}
        onClick={() => {
          append(elementInitialValue);
        }}
      />

      {/* top level field array errors */}
      <FieldArrayValidationError name={name} />
    </div>
  );
};

export default FieldArray;
