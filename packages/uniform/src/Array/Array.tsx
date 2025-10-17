import type { ArrayElementMethods } from './subcomponents/ArrayElement';
import type { ArrayProps } from './types';

import { useEffect, useRef } from 'react';

import { useReducedMotion } from '@fuf-stack/pixel-motion';
import { cn, tv, variantsToClassNames } from '@fuf-stack/pixel-utils';
import { Button } from '@fuf-stack/pixels';

import { toNullishString } from '../helpers';
import { useFieldArray, useUniformField } from '../hooks';
import FieldValidationError from '../partials/FieldValidationError/FieldValidationError';
import ArrayElement from './subcomponents/ArrayElement';
import SortContext from './subcomponents/SortContext';

export const arrayVariants = tv({
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
 * Array component based in [RHF useFieldArray](https://react-hook-form.com/docs/usefieldarray)
 */
const Array = ({
  appendButtonText = 'Add Element',
  children,
  className: _className = undefined,
  duplicate = false,
  elementInitialValue: _elementInitialValue = null,
  elementMarginBottom = undefined,
  insertAfter = false,
  lastElementNotRemovable = false,
  name,
  sortable = false,
  ...uniformFieldProps
}: ArrayProps) => {
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

  // TODO: add info
  const elementInitialValue = toNullishString(_elementInitialValue);

  // Track initial render to prevent animating elements on
  // first render cycle or when user prefers reduced motion
  const prefersReducedMotion = useReducedMotion();
  const disableAnimationRef = useRef(true);
  useEffect(() => {
    if (!prefersReducedMotion) {
      disableAnimationRef.current = false;
    }
  }, [prefersReducedMotion]);

  // When lastElementNotRemovable is set and the array is empty,
  // add an initial element to ensure there's always at least one visible element
  if (lastElementNotRemovable && fields.length === 0) {
    append(elementInitialValue);
  }

  // className from slots
  const variants = arrayVariants();
  const className = variantsToClassNames(variants, _className, 'list');

  return (
    <SortContext fields={fields} move={move} sortable={sortable}>
      <ul className={className.list} data-testid={testId}>
        {/* array label */}
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
          const elementName = `${name}.${index}`;
          const elementTestId = `${testId}_${index}`;

          // create methods for element
          const elementMethods: ArrayElementMethods = {
            append: () => {
              append(elementInitialValue);
            },
            duplicate: () => {
              const values = getValues(name);
              insert(index + 1, values[index]);
            },
            insert: () => {
              insert(index + 1, elementInitialValue);
            },
            remove: () => {
              remove(index);
            },
          };

          return (
            <ArrayElement
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
            </ArrayElement>
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

      {/* top level array errors */}
      {invalid ? (
        <div {...getHelperWrapperProps()}>
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

export default Array;
