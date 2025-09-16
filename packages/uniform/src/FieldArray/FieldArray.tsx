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
    elementWrapper: 'grow',
    insertAfterButton: 'text-xs font-medium',
    label: 'pointer-events-auto! static! z-0! -mb-1 ml-1 inline-block!',
    list: 'm-0 w-full list-none',
    listItem: 'mb-4 flex w-full flex-row',
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
    <SortContext fields={fields} move={move} sortable={sortable}>
      <ul
        className={className.list}
        data-testid={testId}
        /**
         * TODO: this trigger causes the field array (not element)
         * are shown immediately, but this will cause additional
         * render cycles, not sure if we should do this...
         */
        onBlur={async () => {
          return trigger(name);
        }}
      >
        {/* field array label */}
        {showLabel ? (
          <>
            {label ? (
              // eslint-disable-next-line jsx-a11y/label-has-associated-control
              <label
                {...getLabelProps()}
                className={cn(getLabelProps()?.className, className.label)}
              >
                {label}
              </label>
            ) : null}
            {showTestIdCopyButton ? (
              <FieldCopyTestIdButton testId={testId} />
            ) : null}
          </>
        ) : null}

        {fields.map((field, index) => {
          const elementName = `${name}.${index}`;
          const elementTestId = `${testId}_${index}`;

          // create methods for element
          const elementMethods: FieldArrayElementMethods = {
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
            <FieldArrayElement
              key={field.id}
              arrayFieldName={name}
              className={className}
              duplicate={duplicate}
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
        {/* @ts-expect-error rhf incompatibility */}
        {error?._errors ? (
          <div {...getHelperWrapperProps()}>
            <div {...getErrorMessageProps()}>
              {/* @ts-expect-error rhf incompatibility */}
              <FieldValidationError error={error?._errors} testId={testId} />
            </div>
          </div>
        ) : null}
      </ul>
    </SortContext>
  );
};

export default FieldArray;
