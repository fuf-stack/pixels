import type { ReactNode } from 'react';
import type { UniformField } from '../../hooks/useUniformField/types';
import type { DatePickerValue } from '../dateHelpers';
import type { DatePickerClassNames } from '../datePickerVariants';

import {
  DateField,
  DateInput,
  DateSegment,
  Group,
} from 'react-aria-components';

import FieldHelper from '../../partials/FieldHelper/FieldHelper';
import DatePickerTrigger from './DatePickerTrigger';

interface DatePickerInputProps {
  /** Reset bridge rendered inside the date field */
  children: ReactNode;
  /** CSS class name */
  className: DatePickerClassNames;
  /** Bound field values, interactions and metadata */
  field: UniformField<unknown, DatePickerValue>;
}

/**
 * Editable date segments with a calendar trigger and supporting messages
 *
 * Keeps the reset bridge inside DateField so partial edits reset with the form
 *
 * @see https://react-aria.adobe.com/DateField
 * @see https://react-aria.adobe.com/DatePicker
 * @see https://react-aria.adobe.com/Group
 */
const DatePickerInput = ({
  children,
  className: classNames,
  field,
}: DatePickerInputProps) => {
  const { description, errorMessage, ids, invalid, testId } = field;

  return (
    <Group
      className={classNames.inputWrapper}
      data-slot="input-wrapper"
      data-testid={testId}
    >
      <div className={classNames.innerWrapper} data-slot="inner-wrapper">
        <DateField className="flex h-full w-full">
          {children}
          <DateInput className={classNames.input} data-slot="input-field">
            {(segment) => {
              return (
                <DateSegment
                  className={classNames.segment}
                  data-editable={segment.isEditable || undefined}
                  data-slot="segment"
                  segment={segment}
                />
              );
            }}
          </DateInput>
        </DateField>
        <DatePickerTrigger className={classNames} />
      </div>

      {/* help text and validation messages */}
      <FieldHelper
        className={classNames}
        description={description}
        errorMessage={errorMessage}
        ids={ids}
        invalid={invalid}
      />
    </Group>
  );
};

export default DatePickerInput;
