import type { ReactNode } from 'react';
import type { TimeValue } from './timeHelpers';
import type { ClassName, VariantProps } from './timeVariants';

import useUniformField from '../hooks/useUniformField/useUniformField';
import TimeControl from './subcomponents/TimeControl';
import TimeReset from './subcomponents/TimeReset';
import {
  getTimeFieldPlaceholderValue,
  parseTimeValue,
  resolveTimeFieldTimeZone,
  timeValueToString,
} from './timeHelpers';

export { timeVariants } from './timeVariants';

export interface TimeProps extends VariantProps {
  /** Custom aria-label for accessibility. If not provided, falls back to field name when no visible label exists */
  ariaLabel?: string;
  /** CSS class name */
  className?: ClassName;
  /** Optional help text associated with the editable time segments. */
  description?: ReactNode;
  /** input is disabled */
  disabled?: boolean;
  /** smallest visible unit in the segmented time input */
  granularity?: 'hour' | 'minute';
  /** hide timezone abbreviation for zoned values */
  hideTimeZone?: boolean;
  /** force hour granularity and store UTC hour as number (0-23) */
  hourAsNumber?: boolean;
  /** hour cycle formatting */
  hourCycle?: 12 | 24;
  /** form field label */
  label?: ReactNode;
  /** form field name */
  name: string;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
  /**
   * Optional timezone used for parsing date-time strings and serializing values.
   * When omitted, local timezone is used.
   */
  timeZone?: string;
  /** value format stored in form state (`string` stores UTC minute values, e.g. `10:15Z`) */
  valueType?: 'string' | 'timeValue';
}

/** Form input field for a time of day */
const Time = ({
  className = undefined,
  granularity = 'minute',
  hideTimeZone = false,
  hourAsNumber = false,
  hourCycle = undefined,
  name,
  timeZone = undefined,
  valueType = 'string',
  ...uniformFieldProps
}: TimeProps) => {
  const {
    ariaLabel,
    disabled,
    description,
    errorMessage,
    getControlProps,
    ids,
    field,
    invalid,
    label,
    required,
    testId,
  } = useUniformField({ name, ...uniformFieldProps });

  const resolvedTimeZone = resolveTimeFieldTimeZone(timeZone);
  const effectiveGranularity = hourAsNumber ? 'hour' : granularity;

  // `hourAsNumber` stores 0-23; convert this into a parseable UTC time for display.
  const normalizedFieldValue =
    hourAsNumber && typeof field.value === 'number'
      ? `${String(Math.max(0, Math.min(23, field.value))).padStart(2, '0')}:00Z`
      : field.value;

  // Normalize incoming form values for the segmented control.
  const parsedValue = parseTimeValue(normalizedFieldValue, timeZone);
  const placeholderValue = getTimeFieldPlaceholderValue(timeZone);

  // Normalize TimeInput output into the configured storage format.
  const handleChange = (nextValue: TimeValue) => {
    if (nextValue == null) {
      field.onChange(null);
      return;
    }

    if (hourAsNumber) {
      const serializedValue = timeValueToString(
        nextValue,
        resolvedTimeZone,
        'hour',
      );

      if (!serializedValue) {
        field.onChange(null);
        return;
      }

      const [hoursSegment] = serializedValue.split(':');
      const parsedHours = Number(hoursSegment);
      field.onChange(Number.isNaN(parsedHours) ? null : parsedHours);
      return;
    }

    if (valueType === 'timeValue') {
      field.onChange(nextValue);
      return;
    }

    field.onChange(
      timeValueToString(nextValue, resolvedTimeZone, effectiveGranularity) ??
        String(nextValue),
    );
  };

  return (
    <TimeControl
      ariaLabel={uniformFieldProps.ariaLabel ?? (label ? undefined : ariaLabel)}
      className={className}
      controlProps={getControlProps()}
      description={description}
      disabled={disabled}
      errorMessage={errorMessage}
      granularity={effectiveGranularity}
      hideTimeZone={hideTimeZone}
      hourCycle={hourCycle}
      ids={ids}
      inputRef={field.ref}
      invalid={invalid}
      label={label}
      name={name}
      onBlur={field.onBlur}
      onValueChange={handleChange}
      placeholderValue={placeholderValue}
      required={required}
      testId={testId}
      value={parsedValue}
    >
      <TimeReset />
    </TimeControl>
  );
};

export default Time;
