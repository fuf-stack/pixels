import type { FieldArrayElementMethods } from './subcomponents/FieldArrayElement';
import type { FieldArrayProps } from './types';

import { useEffect, useRef } from 'react';

import { useReducedMotion } from '@fuf-stack/pixel-motion';
import { cn, tv, variantsToClassNames } from '@fuf-stack/pixel-utils';
import { Button } from '@fuf-stack/pixels';

import { flatArrayKey } from '../helpers';
import { useFieldArray, useUniformField } from '../hooks';
import FieldValidationError from '../partials/FieldValidationError/FieldValidationError';
import FieldArrayElement from './subcomponents/FieldArrayElement';
import SortContext from './subcomponents/SortContext';

export const fieldArrayVariants = tv({
  slots: {
    appendButton: 'w-full',
    elementWrapper: 'grow',
    insertAfterButton: 'text-xs font-medium',
    label: 'pointer-events-auto! static! z-0! -mb-1 ml-1 inline-block!',
    list: 'm-0 w-full list-none',
    listItem: 'flex w-full flex-row',
    removeButton: 'ml-1',
    sortDragHandle: 'mr-2 text-base text-xl',
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
  } = useUniformField({ name, ...uniformFieldProps });

  const { fields, append, remove, insert, move } = useFieldArray({
    control,
    name,
  });

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
  const className = variantsToClassNames(variants, _className, 'list');

  return (
    <SortContext fields={fields} move={move} sortable={sortable}>
      <ul className={className.list} data-testid={testId}>
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

        {/* fields */}
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

      {/* append elements */}
      <Button
        disableAnimation
        className={className.appendButton}
        size="sm"
        testId={`${testId}_append_button`}
        onClick={() => {
          append(elementInitialValue);
        }}
      >
        {appendButtonText}
      </Button>

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
    </SortContext>
  );
};

export default FieldArray;
