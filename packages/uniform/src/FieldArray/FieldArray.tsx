import type { FieldArrayElementMethods } from './subcomponents/FieldArrayElement';
import type { FieldArrayProps } from './types';

import { useEffect, useRef } from 'react';

import { useReducedMotion } from '@fuf-stack/pixel-motion';
import { cn, tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import { flatArrayKey } from '../helpers';
import { useFieldArray, useUniformField } from '../hooks';
import { useFormContext } from '../hooks/useFormContext/useFormContext';
import FieldValidationError from '../partials/FieldValidationError/FieldValidationError';
import ElementAppendButton from './subcomponents/ElementAppendButton';
import FieldArrayElement from './subcomponents/FieldArrayElement';
import SortContext from './subcomponents/SortContext';

export const fieldArrayVariants = tv({
  slots: {
    /** base class for the field array wrapper */
    base: [
      // base styles
      'rounded-small border-divider bg-background overflow-hidden border',
      // divider between items
      'divide-divider divide-y',
    ],
    /** class for the append button */
    appendButton: [
      'w-full',
      // focus styles - inset ring with rounded bottom corners to match container
      'focus-visible:ring-focus outline-none focus-visible:ring-2 focus-visible:ring-inset',
      '!rounded-b-small !rounded-t-none',
    ],
    /** class for the element fields grid */
    elementFieldsGrid: ['w-full grow p-3'],
    /** class for the insert after button */
    insertAfterButton: ['text-xs font-medium'],
    /** class for the label */
    label: [
      'pointer-events-auto! static! z-0!',
      // label positioning
      '-mb-1 ml-1 inline-block!',
    ],
    /** class for the list wrapper */
    listWrapper: ['-mt-px overflow-hidden'],
    /** class for the list */
    list: ['overflow-hidden'],
    /** class for the list item (performs motion animations) */
    listItem: [
      // base styles
      'group relative flex flex-row',
    ],
    /** class for the list item inner */
    listItemInner: [
      // base styles
      'bg-content1 divide-divider flex w-full flex-row items-stretch',
      // x division and borders
      'border-divider divide-x divide-solid border-t border-b',
    ],
    /** class for the remove button */
    removeButton: [
      // base styles
      'flex items-center justify-center',
      // fixed height/no round corners
      '!h-full !min-h-0 !rounded-none px-3',
      // focus styles - inset ring with top-right corner rounded for first item only
      'focus-visible:ring-focus outline-none focus-visible:ring-2 focus-visible:ring-inset',
      'group-[:first-child]:!rounded-tr-small group-[:first-child]:group-data-[dragging=true]:!rounded-tr-none',
    ],
    /** class for the sort drag handle */
    sortDragHandle: [
      // base styles
      'text-default-500 flex cursor-grab items-center justify-center px-2 transition-colors',
      // hover and  dragging state
      'hover:bg-default-100 group-data-[dragging=true]:bg-default-100 active:cursor-grabbing',
      // focus styles - inset ring with top-left corner rounded for first item only
      'focus-visible:ring-focus outline-none focus-visible:ring-2 focus-visible:ring-inset',
      'group-[:first-child]:rounded-tl-small group-[:first-child]:group-data-[dragging=true]:rounded-tl-none',
    ],
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
  const {
    control,
    error,
    getErrorMessageProps,
    getHelperWrapperProps,
    getLabelProps,
    getValues,
    invalid,
    label,
    testId,
  } = useUniformField({
    name,
    showInvalidWhen: 'immediate',
    ...uniformFieldProps,
  });

  const { fields, append, remove, insert, move } = useFieldArray({
    control,
    name,
  });

  // Validate array-level constraints immediately when length changes
  const { trigger } = useFormContext();
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

  // Track initial render to prevent animating elements on
  // first render cycle or when user prefers reduced motion
  const prefersReducedMotion = useReducedMotion();
  const disableAnimationRef = useRef(true);
  useEffect(() => {
    if (!prefersReducedMotion) {
      disableAnimationRef.current = false;
    }
  }, [prefersReducedMotion]);

  // When lastElementNotRemovable is set and the field array is empty,
  // add an initial element to ensure there's always at least one visible element
  if (lastElementNotRemovable && fields.length === 0) {
    append(elementInitialValue);
  }

  // className from slots
  const variants = fieldArrayVariants();
  const className = variantsToClassNames(variants, _className, 'base');

  return (
    <div className={className.base}>
      {/* field array label */}
      {label ? (
        // eslint-disable-next-line jsx-a11y/label-has-associated-control
        <label
          {...getLabelProps()}
          className={cn(getLabelProps()?.className, className.label)}
        >
          {label}
        </label>
      ) : null}

      {/* sortable context */}
      <SortContext fields={fields} move={move} sortable={sortable}>
        {/* list wrapper */}
        <div className={className.listWrapper}>
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
        </div>
      </SortContext>

      {/* append elements button */}
      <ElementAppendButton
        appendButtonText={appendButtonText}
        className={className.appendButton}
        testId={`${testId}_append_button`}
        onClick={() => {
          append(elementInitialValue);
        }}
      />

      {/* top level field array errors */}
      {invalid ? (
        <div
          {...getHelperWrapperProps()}
          // force helper to be visible (for some reason it's hidden by default)
          className={cn(getHelperWrapperProps()?.className, 'block')}
        >
          <div {...getErrorMessageProps()}>
            <FieldValidationError
              // @ts-expect-error todo
              // eslint-disable-next-line no-underscore-dangle
              error={error?._errors}
              testId={testId}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default FieldArray;
