import type { DatePicker as HeroDatePicker } from '@heroui/date-picker';
import type { ComponentProps } from 'react';

import {
  getLocalTimeZone,
  now,
  parseAbsolute,
  parseAbsoluteToLocal,
  parseDate,
  parseDateTime,
  parseZonedDateTime,
} from '@internationalized/date';

/** Value type accepted by the HeroUI DatePicker */
export type DatePickerValue = ComponentProps<typeof HeroDatePicker>['value'];

/** Cast unknown input to the DatePicker value union type. */
const asDatePickerValue = (value: unknown): DatePickerValue => {
  return value as DatePickerValue;
};

/** Check whether a value already looks like an @internationalized/date object. */
const isDateValueLike = (value: unknown): value is object => {
  return !!value && typeof value === 'object' && 'calendar' in value;
};

/** True for ISO datetime strings that do not yet include timezone information. */
const isNaiveDateTimeString = (value: string): boolean => {
  return /^\d{4}-\d{2}-\d{2}T/.test(value) && !hasExplicitTimeZone(value);
};

/** True when an input already carries timezone/offset information. */
const hasExplicitTimeZone = (value: string): boolean => {
  if (value.includes('[') && value.includes(']')) {
    return true;
  }

  return /(?:[zZ]|[+-]\d{2}:\d{2})$/.test(value);
};

/** Safely run a parser and return `null` on parsing errors. */
const tryParse = (parser: () => unknown): DatePickerValue => {
  try {
    return asDatePickerValue(parser());
  } catch {
    return null;
  }
};

/**
 * Parse a form value into a HeroUI DatePicker compatible `DateValue`.
 *
 * Accepts existing `DateValue` objects, native `Date` instances, and ISO-like
 * strings (date, date-time, zoned, and absolute). Returns `null` when the value
 * is empty or cannot be parsed.
 */
export const parseDateValue = (
  value: unknown,
  timeZone?: string,
): DatePickerValue => {
  if (value == null || value === '') {
    return null;
  }

  if (isDateValueLike(value)) {
    return asDatePickerValue(value);
  }

  if (value instanceof Date) {
    return asDatePickerValue(
      timeZone
        ? parseAbsolute(value.toISOString(), timeZone)
        : parseAbsoluteToLocal(value.toISOString()),
    );
  }

  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim();
  if (normalizedValue === '') {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
    return tryParse(() => {
      return parseDate(normalizedValue);
    });
  }

  const parsers: (() => unknown)[] = [
    ...(timeZone && isNaiveDateTimeString(normalizedValue)
      ? [
          () => {
            return parseZonedDateTime(`${normalizedValue}[${timeZone}]`);
          },
        ]
      : []),
    () => {
      return timeZone
        ? parseAbsolute(normalizedValue, timeZone)
        : parseAbsoluteToLocal(normalizedValue);
    },
    () => {
      return parseZonedDateTime(normalizedValue);
    },
    () => {
      return parseDateTime(normalizedValue);
    },
    () => {
      return parseDate(normalizedValue);
    },
  ];

  return (
    parsers
      .map((parser) => {
        return tryParse(parser);
      })
      .find((parsedValue) => {
        return parsedValue != null;
      }) ?? null
  );
};

/** Resolve the timezone used by the DatePicker when time fields are enabled. */
export const resolveDatePickerTimeZone = (
  withTime: boolean,
  timeZone?: string,
): string | undefined => {
  if (!withTime) {
    return timeZone;
  }

  return timeZone ?? getLocalTimeZone();
};

/** Build the default placeholder value for time-enabled pickers. */
export const getDatePickerPlaceholderValue = (
  withTime: boolean,
  timeZone?: string,
): DatePickerValue => {
  const resolvedTimeZone = resolveDatePickerTimeZone(withTime, timeZone);
  if (!resolvedTimeZone || !withTime) {
    return undefined;
  }

  return asDatePickerValue(now(resolvedTimeZone));
};

/**
 * Convert a date value into a UTC ISO string.
 *
 * `CalendarDate` and `CalendarDateTime` values are interpreted in the provided
 * timezone. `ZonedDateTime` values use their own timezone and offset.
 */
export const dateValueToUtcIsoString = (
  value: DatePickerValue,
  timeZone: string,
): string | null => {
  if (value == null) {
    return null;
  }

  const maybeWithAbsoluteString = value as { toAbsoluteString?: () => string };
  if (typeof maybeWithAbsoluteString.toAbsoluteString === 'function') {
    return maybeWithAbsoluteString.toAbsoluteString();
  }

  const maybeWithToDate = value as { toDate?: (zone: string) => Date };
  if (typeof maybeWithToDate.toDate === 'function') {
    return maybeWithToDate.toDate(timeZone).toISOString();
  }

  return null;
};
