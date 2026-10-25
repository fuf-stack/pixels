import type { ReactNode } from 'react';
import type { UniformField } from '../../hooks/useUniformField/types';
import type { DatePickerValue } from '../dateHelpers';
import type { DatePickerProps } from '../DatePicker';

import { DatePicker as AriaDatePicker, Label } from 'react-aria-components';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { getFieldControlProps } from '../../helpers/fieldProps/fieldProps';
import FieldLabel from '../../partials/FieldLabel/FieldLabel';
import {
  getDatePickerPlaceholderValue,
  parseDateValue,
  resolveDatePickerTimeZone,
} from '../dateHelpers';
import { datePickerVariants } from '../datePickerVariants';
import DatePickerCalendar from './DatePickerCalendar';
import DatePickerInput from './DatePickerInput';

interface DatePickerControlProps extends Pick<
  DatePickerProps,
  | 'className'
  | 'hideTimeZone'
  | 'hourCycle'
  | 'maxValue'
  | 'minValue'
  | 'timeZone'
  | 'withTime'
> {
  /** Reset bridge rendered inside the date engine */
  children: ReactNode;
  /** Bound field values, interactions and metadata */
  field: UniformField<unknown, DatePickerValue>;
}

/**
 * Date input presentation with editable segments, field messages and calendar
 *
 * @see https://react-aria.adobe.com/DatePicker
 */
const DatePickerControl = ({
  children,
  className,
  field,
  hideTimeZone,
  hourCycle,
  maxValue,
  minValue,
  timeZone,
  withTime = false,
}: DatePickerControlProps) => {
  const styling = useStyling();

  const {
    disabled,
    ids,
    ref: inputRef,
    invalid,
    label,
    name,
    onBlur,
    onChange: onValueChange,
    required,
  } = field;

  // associate the editable control with its label and messages
  const controlProps = getFieldControlProps(field);

  const resolvedTimeZone = resolveDatePickerTimeZone(withTime, timeZone);
  const displayTimeZone = withTime ? resolvedTimeZone : timeZone;

  // parse stored values and boundaries for the date engine
  const value = parseDateValue(field.value, displayTimeZone);
  const parsedMinValue = parseDateValue(minValue, displayTimeZone);
  const parsedMaxValue = parseDateValue(maxValue, displayTimeZone);

  const placeholderValue = getDatePickerPlaceholderValue(withTime, timeZone);

  // classNames from slots
  const variants = styling.resolve(datePickerVariants, { disabled });
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  // route form focus to the first enabled date segment
  const handleControlRef = (element: HTMLDivElement | null) => {
    inputRef(
      element
        ? {
            focus: () => {
              element
                .querySelector<HTMLElement>(
                  '[role="spinbutton"]:not([aria-disabled="true"])',
                )
                ?.focus();
            },
          }
        : null,
    );
  };

  return (
    <AriaDatePicker
      ref={handleControlRef}
      aria-describedby={controlProps['aria-describedby']}
      aria-invalid={controlProps['aria-invalid']}
      aria-label={controlProps['aria-label']}
      className={classNames.base}
      data-component="date-picker"
      data-slot="base"
      granularity={withTime ? 'minute' : 'day'}
      hideTimeZone={hideTimeZone}
      hourCycle={hourCycle}
      id={controlProps.id}
      isDisabled={disabled}
      isInvalid={invalid}
      isRequired={required}
      maxValue={parsedMaxValue ?? undefined}
      minValue={parsedMinValue ?? undefined}
      name={name}
      onBlur={onBlur}
      onChange={onValueChange}
      placeholderValue={placeholderValue ?? undefined}
      shouldCloseOnSelect={!withTime}
      shouldForceLeadingZeros
      validationBehavior="aria"
      value={value ?? null}
    >
      {({ state }) => {
        return (
          <>
            {/* field label */}
            {label ? (
              <FieldLabel
                as={Label}
                className={classNames.label}
                id={ids.label}
                required={required}
              >
                {label}
              </FieldLabel>
            ) : null}

            {/* date segments and calendar trigger */}
            <DatePickerInput className={classNames} field={field}>
              {children}
            </DatePickerInput>

            {/* calendar popup */}
            <DatePickerCalendar
              className={classNames}
              hideTimeZone={hideTimeZone}
              hourCycle={hourCycle}
              maxValue={parsedMaxValue}
              minValue={parsedMinValue}
              placeholderValue={placeholderValue}
              state={state}
              withTime={withTime}
            />
          </>
        );
      }}
    </AriaDatePicker>
  );
};

export default DatePickerControl;
