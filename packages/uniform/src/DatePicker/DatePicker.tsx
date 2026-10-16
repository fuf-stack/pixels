import type { ReactNode } from 'react';
import type { DatePickerValue } from './dateHelpers';
import type { ClassName, VariantProps } from './datePickerVariants';

import useUniformField from '../hooks/useUniformField/useUniformField';
import {
  dateValueToUtcIsoString,
  getDatePickerPlaceholderValue,
  parseDateValue,
  resolveDatePickerTimeZone,
} from './dateHelpers';
import DatePickerControl from './subcomponents/DatePickerControl';
import DatePickerReset from './subcomponents/DatePickerReset';

export { datePickerVariants } from './datePickerVariants';

export interface DatePickerProps extends VariantProps {
  /** Custom aria-label for accessibility. If not provided, falls back to field name when no visible label exists */
  ariaLabel?: string;
  /** CSS class name */
  className?: ClassName;
  /** Optional help text associated with editable date segments. */
  description?: ReactNode;
  /** date picker is disabled */
  disabled?: boolean;
  /**
   * Optional hour cycle override.
   *
   * Defaults to a 24-hour cycle.
   */
  hourCycle?: 12 | 24;
  /** hide timezone abbreviation for zoned values */
  hideTimeZone?: boolean;
  /** form field label */
  label?: ReactNode;
  /** latest selectable value as ISO string */
  maxValue?: string;
  /** earliest selectable value as ISO string */
  minValue?: string;
  /** form field name */
  name: string;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
  /**
   * Optional advanced override for the display/interpretation timezone.
   *
   * When omitted, the picker uses the current user's local timezone while
   * `withTime` is enabled.
   */
  timeZone?: string;
  /**
   * Enables date-time mode.
   *
   * - `false` (default): date-only input (`day` granularity)
   * - `true`: includes time segments (`minute` granularity)
   */
  withTime?: boolean;
  /** value format stored in form state (`string` stores UTC ISO values) */
  valueType?: 'dateValue' | 'string';
}

/** Form input field for a date, with an optional time and calendar picker */
const DatePicker = ({
  className = undefined,
  hourCycle = 24,
  hideTimeZone = false,
  maxValue = undefined,
  minValue = undefined,
  name,
  timeZone = undefined,
  valueType = 'string',
  withTime = false,
  ...uniformFieldProps
}: DatePickerProps) => {
  const {
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

  const resolvedTimeZone = resolveDatePickerTimeZone(withTime, timeZone);

  // Normalize incoming form value into DateValue shape so the field can
  // render consistently from UTC strings, local strings, Date instances, or DateValue objects.
  const parsedValue = parseDateValue(
    field.value,
    withTime ? resolvedTimeZone : timeZone,
  );

  // Build the default placeholder value for time-enabled pickers.
  const placeholderValue = getDatePickerPlaceholderValue(withTime, timeZone);

  // Parse ISO boundary strings into DateValue objects.
  const parsedMinValue = parseDateValue(
    minValue,
    withTime ? resolvedTimeZone : timeZone,
  );
  const parsedMaxValue = parseDateValue(
    maxValue,
    withTime ? resolvedTimeZone : timeZone,
  );

  // Normalize DatePicker output into the configured storage format before writing to form state.
  const handleChange = (nextValue: DatePickerValue) => {
    if (nextValue == null) {
      field.onChange(null);
      return;
    }

    if (valueType === 'dateValue') {
      field.onChange(nextValue);
      return;
    }

    // String mode always stores UTC ISO values so form state is timezone-neutral
    // and comparable across users/locales.
    field.onChange(
      dateValueToUtcIsoString(nextValue, resolvedTimeZone ?? 'UTC') ??
        String(nextValue),
    );
  };

  return (
    <DatePickerControl
      className={className}
      controlProps={getControlProps()}
      description={description}
      disabled={disabled}
      errorMessage={errorMessage}
      hideTimeZone={hideTimeZone}
      hourCycle={hourCycle}
      ids={ids}
      inputRef={field.ref}
      invalid={invalid}
      label={label}
      maxValue={parsedMaxValue}
      minValue={parsedMinValue}
      name={name}
      onBlur={field.onBlur}
      onValueChange={handleChange}
      placeholderValue={placeholderValue}
      required={required}
      testId={testId}
      value={parsedValue}
      withTime={withTime}
    >
      <DatePickerReset />
    </DatePickerControl>
  );
};

export default DatePicker;
