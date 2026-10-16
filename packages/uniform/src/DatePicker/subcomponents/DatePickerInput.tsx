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

import FieldDescription from '../../partials/FieldDescription/FieldDescription';
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
      {description || invalid ? (
        <div className={classNames.helperWrapper} data-slot="helper-wrapper">
          <FieldDescription
            className={classNames.description}
            id={ids.description}
          >
            {description}
          </FieldDescription>
          {invalid ? (
            <div
              className={classNames.errorMessage}
              data-slot="error-message"
              id={ids.error}
            >
              {errorMessage}
            </div>
          ) : null}
        </div>
      ) : null}
    </Group>
  );
};

export default DatePickerInput;
