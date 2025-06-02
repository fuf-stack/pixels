/* eslint-disable react/jsx-props-no-spreading */

import type { FieldArrayElementMethods } from './subcomponents/FieldArrayElement';
import type { FieldArrayProps } from './types';

import { cn, tv, variantsToClassNames } from '@fuf-stack/pixel-utils';
import { Button } from '@fuf-stack/pixels';

import { toNullishString } from '../helpers';
import { useFieldArray, useFormContext, useInput } from '../hooks';
import { FieldCopyTestIdButton } from '../partials/FieldCopyTestIdButton';
import { FieldValidationError } from '../partials/FieldValidationError';
import FieldArrayElement from './subcomponents/FieldArrayElement';
import SortContext from './subcomponents/SortContext';

export const fieldArrayVariants = tv({
  slots: {
    appendButton: 'w-full',
    elementWrapper: 'flex-grow',
    insertAfterButton: 'text-xs font-medium',
    label: '!pointer-events-auto !static !z-0 -mb-1 ml-1 !inline-block',
    list: 'm-0 w-full list-none',
    listItem: 'mb-4 flex w-full flex-row items-center',
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
  insertAfter = false,
  label: _label = undefined,
  lastElementNotRemovable = false,
  name,
  sortable = false,
  testId: _testId = undefined,
}: FieldArrayProps) => {
  // className from slots
  const variants = fieldArrayVariants();
  const className = variantsToClassNames(variants, _className, 'list');

  const {
    control,
    debugMode,
    getValues,
    getFieldState,
    trigger,
    // watch
  } = useFormContext();

  const { fields, append, remove, insert, move } = useFieldArray({
    control,
    name,
  });

  const { error, testId, invalid, required } = getFieldState(name, _testId);

  // TODO: what about input props?
  const { label, getLabelProps, getHelperWrapperProps, getErrorMessageProps } =
    useInput({
      isInvalid: invalid,
      isRequired: required,
      errorMessage: JSON.stringify(error),
      label: _label,
      labelPlacement: 'inside',
      placeholder: ' ',
      classNames: { helperWrapper: 'block' },
    });

  // TODO: add info
  const elementInitialValue = toNullishString(_elementInitialValue);

  // When lastElementNotRemovable is set and the field array is empty,
  // add an initial element to ensure there's always at least one visible element
  if (lastElementNotRemovable && fields.length === 0) {
    append(elementInitialValue);
  }

  const showTestIdCopyButton = debugMode === 'debug-testids';
  const showLabel = label || showTestIdCopyButton;

  return (
    <SortContext sortable={sortable} move={move} fields={fields}>
      <ul
        className={className.list}
        data-testid={testId}
        /**
         * TODO: this trigger causes the field array (not element)
         * are shown immediately, but this will cause additional
         * render cycles, not sure if we should do this...
         */
        onBlur={() => trigger(`${name}`)}
      >
        {/* field array label */}
        {showLabel && (
          <>
            {label && (
              // eslint-disable-next-line jsx-a11y/label-has-associated-control
              <label
                {...getLabelProps()}
                className={cn(getLabelProps()?.className, className.label)}
              >
                {label}
              </label>
            )}
            {showTestIdCopyButton && <FieldCopyTestIdButton testId={testId} />}
          </>
        )}

        {fields.map((field, index) => {
          const elementName = `${name}.${index}`;
          const elementTestId = `${testId}${index}`;

          // create methods for element
          const elementMethods: FieldArrayElementMethods = {
            append: () => append(elementInitialValue),
            duplicate: () => {
              const values = getValues(name);
              insert(index + 1, values[index]);
            },
            insert: () => insert(index + 1, elementInitialValue),
            remove: () => remove(index),
          };

          return (
            <FieldArrayElement
              arrayFieldName={name}
              className={className}
              fields={fields}
              id={field.id}
              index={index}
              duplicate={duplicate}
              insertAfter={insertAfter}
              key={field.id}
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

        {/* append elements */}
        <Button
          className={className.appendButton}
          disableAnimation
          onClick={() => append(elementInitialValue)}
          size="sm"
          testId={`${testId}_append_button`}
        >
          {appendButtonText}
        </Button>

        {/* top level field array errors */}
        {/* @ts-expect-error rhf incompatibility */}
        {error?._errors && (
          <div {...getHelperWrapperProps()}>
            <div {...getErrorMessageProps()}>
              {/* @ts-expect-error rhf incompatibility */}
              <FieldValidationError error={error?._errors} testId={testId} />
            </div>
          </div>
        )}
      </ul>
    </SortContext>
  );
};

export default FieldArray;
