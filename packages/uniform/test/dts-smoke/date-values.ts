import type { DatePickerProps, TimeFieldProps } from 'react-aria-components';

import {
  CalendarDate,
  CalendarDateTime,
  Time,
  ZonedDateTime,
} from '@internationalized/date';

// use Uniform's date classes with the types resolved by React Aria
const dateTime = new CalendarDateTime(2026, 10, 16, 12);
const zonedDateTime = new ZonedDateTime(2026, 10, 16, 'UTC', 0, 12);

export const timeProps: TimeFieldProps<
  Time | CalendarDateTime | ZonedDateTime
> = {
  maxValue: zonedDateTime,
  minValue: dateTime,
  placeholderValue: dateTime,
  value: new Time(12),
};

export const dateProps: DatePickerProps<
  CalendarDate | CalendarDateTime | ZonedDateTime
> = {
  maxValue: zonedDateTime,
  minValue: dateTime,
  placeholderValue: dateTime,
  value: new CalendarDate(2026, 10, 16),
};
