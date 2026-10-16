import type { ReactNode } from 'react';
import type { ClassName } from './timeVariants';

import useUniformField from '../hooks/useUniformField/useUniformField';
import TimeControl from './subcomponents/TimeControl';
import TimeReset from './subcomponents/TimeReset';
import { createTimeValueTransform } from './timeHelpers';

export { timeVariants } from './timeVariants';

export interface TimeProps {
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
  const transform = createTimeValueTransform({
    granularity,
    hourAsNumber,
    timeZone,
    valueType,
  });

  const { field } = useUniformField({
    ...uniformFieldProps,
    name,
    transform,
  });

  return (
    <TimeControl
      className={className}
      field={field}
      granularity={granularity}
      hideTimeZone={hideTimeZone}
      hourAsNumber={hourAsNumber}
      hourCycle={hourCycle}
      timeZone={timeZone}
    >
      <TimeReset />
    </TimeControl>
  );
};

export default Time;
