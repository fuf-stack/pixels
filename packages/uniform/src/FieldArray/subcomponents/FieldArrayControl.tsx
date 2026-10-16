import type { FieldError } from 'react-hook-form';
import type { FieldIds } from '../../partials/types';
import type { FieldArrayProps } from '../FieldArray';

import { useId } from 'react';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { fieldArrayVariants } from '../fieldArrayVariants';
import ElementAppendButton from './ElementAppendButton';
import FieldArrayElement from './FieldArrayElement';
import FieldArrayLabel from './FieldArrayLabel';
import FieldArrayValidationError from './FieldArrayValidationError';
import SortContext from './SortContext';

export interface FieldArrayItem {
  /** Stable row ID supplied by React Hook Form */
  id: string;
  /** Bound row name, operations and child render arguments */
  renderProps: Parameters<FieldArrayProps['children']>[0];
}

interface FieldArrayControlProps extends Pick<
  FieldArrayProps,
  | 'appendButtonText'
  | 'children'
  | 'className'
  | 'duplicate'
  | 'elementMarginBottom'
  | 'insertAfter'
  | 'label'
  | 'lastElementNotRemovable'
  | 'name'
  | 'sortable'
> {
  /** Disables animation during array initialization */
  disableAnimation: boolean;
  /** Array-level validation errors */
  error: FieldError[] | undefined;
  /** Stable row IDs used by the sorting engine */
  fields: Record<'id', string>[];
  /** IDs shared with the validation footer */
  ids: FieldIds;
  /** Shows array-level validation failure */
  invalid: boolean;
  /** Bound rows to arrange in the list */
  items: FieldArrayItem[];
  /** Callback when the append button is activated */
  onAppend: () => void;
  /** Callback when sorting moves a row */
  onMove: (from: number, to: number) => void;
  /** Marks the array label as required */
  required: boolean;
  /** HTML data-testid attribute for e2e tests */
  testId: string;
}

/** Array group presentation with row controls, sorting and validation messages */
const FieldArrayControl = ({
  appendButtonText,
  children,
  className,
  disableAnimation,
  duplicate,
  elementMarginBottom,
  error,
  fields,
  ids,
  invalid,
  items,
  insertAfter,
  label,
  lastElementNotRemovable,
  name,
  onAppend,
  onMove,
  required,
  sortable = false,
  testId,
}: FieldArrayControlProps) => {
  // @ts-expect-error - object-level errors include an _errors property
  const hasArrayErrors = !!(invalid && error?._errors);

  // classNames from slots
  const labelId = useId();
  const styling = useStyling();
  const { cn } = styling;
  const variants = styling.resolve(fieldArrayVariants, { hasLabel: !!label });
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  return (
    <div
      aria-label={!label ? name : undefined}
      aria-labelledby={label ? labelId : undefined}
      className={classNames.base}
      role="group"
    >
      {/* field array label */}
      <FieldArrayLabel
        className={classNames.label}
        id={labelId}
        invalid={hasArrayErrors}
        label={label}
        required={required}
      />

      {fields.length ? (
        /* list wrapper */
        <div className={cn(classNames.listWrapper)}>
          {/* sortable context */}
          <SortContext fields={fields} move={onMove} sortable={sortable}>
            {/* list container */}
            <ul className={classNames.list} data-testid={testId}>
              {/* fields / list elements  */}
              {items.map(({ id, renderProps }) => {
                return (
                  <FieldArrayElement
                    key={id}
                    className={classNames}
                    disableAnimation={disableAnimation}
                    duplicate={duplicate}
                    elementMarginBottom={elementMarginBottom}
                    fields={fields}
                    id={id}
                    index={renderProps.index}
                    insertAfter={insertAfter}
                    lastNotDeletable={lastElementNotRemovable}
                    methods={renderProps.methods}
                    sortable={sortable}
                    testId={renderProps.testId}
                  >
                    {children(renderProps)}
                  </FieldArrayElement>
                );
              })}
            </ul>
          </SortContext>
        </div>
      ) : null}

      {/* top level field array errors */}
      <FieldArrayValidationError
        error={error}
        ids={ids}
        invalid={invalid}
        testId={testId}
      />

      {/* append elements button */}
      <ElementAppendButton
        appendButtonText={appendButtonText}
        className={classNames.appendButton}
        onClick={onAppend}
        testId={`${testId}_append_button`}
      />
    </div>
  );
};

export default FieldArrayControl;
