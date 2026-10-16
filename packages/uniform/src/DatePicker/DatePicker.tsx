import type { ReactNode } from 'react';
import type { ClassName } from './datePickerVariants';

import useUniformField from '../hooks/useUniformField/useUniformField';
import { createDatePickerValueTransform } from './dateHelpers';
import DatePickerControl from './subcomponents/DatePickerControl';
import DatePickerReset from './subcomponents/DatePickerReset';

export { datePickerVariants } from './datePickerVariants';

export interface DatePickerProps {
  /** Custom aria-label for accessibility. If not provided, falls back to field name when no visible label exists */
  ariaLabel?: string;
  /** CSS class name */
  className?: ClassName;
  /** Optional help text associated with editable date segments. */
  description?: ReactNode;
  /** date picker is disabled */
  disabled?: boolean;
  /** hide timezone abbreviation for zoned values */
  hideTimeZone?: boolean;
  /**
   * Optional hour cycle override.
   *
   * Defaults to a 24-hour cycle.
   */
  hourCycle?: 12 | 24;
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
  /** value format stored in form state (`string` stores UTC ISO values) */
  valueType?: 'dateValue' | 'string';
  /**
   * Enables date-time mode.
   *
   * - `false` (default): date-only input (`day` granularity)
   * - `true`: includes time segments (`minute` granularity)
   */
  withTime?: boolean;
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
  const transform = createDatePickerValueTransform({
    timeZone,
    valueType,
    withTime,
  });

  const { field } = useUniformField({
    ...uniformFieldProps,
    name,
    transform,
  });

  return (
    <DatePickerControl
      className={className}
      field={field}
      hideTimeZone={hideTimeZone}
      hourCycle={hourCycle}
      maxValue={maxValue}
      minValue={minValue}
      timeZone={timeZone}
      withTime={withTime}
    >
      <DatePickerReset />
    </DatePickerControl>
  );
};

export default DatePicker;
