import type { UniformField } from '../../hooks/useUniformField/types';
import type { FieldArrayItem } from '../../hooks/useUniformFieldArray/types';
import type { FieldArrayProps } from '../FieldArray';

import { useId } from 'react';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { fieldArrayVariants } from '../fieldArrayVariants';
import ElementAppendButton from './ElementAppendButton';
import FieldArrayElement from './FieldArrayElement';
import FieldArrayLabel from './FieldArrayLabel';
import FieldArrayValidationError from './FieldArrayValidationError';
import SortContext from './SortContext';

export type { FieldArrayItem } from '../../hooks/useUniformFieldArray/types';

interface FieldArrayControlProps extends Pick<
  FieldArrayProps,
  | 'appendButtonText'
  | 'children'
  | 'className'
  | 'duplicate'
  | 'elementMarginBottom'
  | 'insertAfter'
  | 'lastElementNotRemovable'
  | 'sortable'
> {
  /** Disables animation during array initialization */
  disableAnimation: boolean;
  /** Bound field values, interactions and metadata */
  field: UniformField;
  /** Stable row IDs used by the sorting engine */
  fields: Record<'id', string>[];
  /** Bound rows to arrange in the list */
  items: FieldArrayItem[];
  /** Callback when the append button is activated */
  onAppend: () => void;
  /** Callback when sorting moves a row */
  onMove: (from: number, to: number) => void;
}

/** Array group presentation with row controls, sorting and validation messages */
const FieldArrayControl = ({
  field,
  appendButtonText,
  children,
  className,
  disableAnimation,
  duplicate,
  elementMarginBottom,
  fields,
  items,
  insertAfter,
  lastElementNotRemovable,
  onAppend,
  onMove,
  sortable = false,
}: FieldArrayControlProps) => {
  const { error, ids, invalid, name, required, testId } = field;

  // keep the array heading hidden when only debug label content exists
  const label = field.hasLabel ? field.label : undefined;

  const styling = useStyling();
  const labelId = useId();

  // @ts-expect-error - object-level errors include an _errors property
  const hasArrayErrors = !!(invalid && error?._errors);

  const { cn } = styling;

  // classNames from slots
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
        /* sortable rows */
        <div className={cn(classNames.listWrapper)}>
          <SortContext fields={fields} move={onMove} sortable={sortable}>
            <ul className={classNames.list} data-testid={testId}>
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
