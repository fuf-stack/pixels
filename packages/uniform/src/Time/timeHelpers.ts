import type { TimeInput as HeroTimeInput } from '@heroui/date-input';
import type { ComponentProps } from 'react';

import {
  getLocalTimeZone,
  parseAbsolute,
  parseAbsoluteToLocal,
  parseDateTime,
  parseZonedDateTime,
} from '@internationalized/date';

/** Value type accepted by HeroUI TimeInput */
export type TimeValue = ComponentProps<typeof HeroTimeInput>['value'];

/** Cast unknown input to the TimeInput value union type. */
const asTimeValue = (value: unknown): TimeValue => {
  return value as TimeValue;
};

/** Check whether a value already looks like an @internationalized/date value. */
const isTimeValueLike = (value: unknown): value is object => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return 'hour' in value || 'calendar' in value;
};

/** Check if the incoming string represents a plain time (e.g. 09:30 or 09:30:45). */
const isTimeOnlyString = (value: string): boolean => {
  return /^\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?$/.test(value);
};

/** Check if the incoming string is a UTC time-only value (e.g. 09:30Z). */
const isUtcTimeOnlyString = (value: string): boolean => {
  return /^\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?Z$/.test(value);
};

/** Zero-pad integer segments for time serialization. */
const pad = (value: number): string => {
  return String(value).padStart(2, '0');
};

/** Convert an absolute ISO string into UTC time-only store format. */
const toUtcTimeString = (
  absoluteIsoString: string,
  granularity: 'hour' | 'minute',
): string | null => {
  const utcDate = new Date(absoluteIsoString);
  if (Number.isNaN(utcDate.getTime())) {
    return null;
  }

  const hour = pad(utcDate.getUTCHours());
  if (granularity === 'hour') {
    return `${hour}:00Z`;
  }

  return `${hour}:${pad(utcDate.getUTCMinutes())}Z`;
};

/** True when an input already carries timezone/offset information. */
const hasExplicitTimeZone = (value: string): boolean => {
  if (value.includes('[') && value.includes(']')) {
    return true;
  }

  return /(?:[zZ]|[+-]\d{2}:\d{2})$/.test(value);
};

/** True for date-time strings without timezone/offset. */
const isNaiveDateTimeString = (value: string): boolean => {
  return /^\d{4}-\d{2}-\d{2}T/.test(value) && !hasExplicitTimeZone(value);
};

/** Safely run a parser and return `null` on parsing errors. */
const tryParse = (parser: () => unknown): TimeValue => {
  try {
    return asTimeValue(parser());
  } catch {
    return null;
  }
};

/**
 * Parse a form value into a HeroUI TimeInput compatible `TimeValue`.
 *
 * Supports existing `TimeValue` objects, native `Date` instances, plain time
 * strings (`HH:mm[:ss]`), absolute ISO date-time strings, zoned date-time
 * strings, and local date-time strings.
 *
 * Time-only strings are interpreted in the active timezone and normalized to a
 * `ZonedDateTime` (using a fixed reference date) so timezone abbreviations can
 * remain visible in the UI.
 */
export const parseTimeValue = (
  value: unknown,
  timeZone?: string,
): TimeValue => {
  if (value == null || value === '') {
    return null;
  }

  if (isTimeValueLike(value)) {
    return asTimeValue(value);
  }

  if (value instanceof Date) {
    return asTimeValue(
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

  if (isTimeOnlyString(normalizedValue)) {
    return tryParse(() => {
      const [hourValue, minuteValue, secondValue] = normalizedValue
        .split(':')
        .map(Number);
      const resolvedTimeZone = resolveTimeFieldTimeZone(timeZone);
      const hour = pad(hourValue);
      const minute = pad(minuteValue);
      const second = pad(secondValue ?? 0);

      return parseZonedDateTime(
        `1970-01-01T${hour}:${minute}:${second}[${resolvedTimeZone}]`,
      );
    });
  }

  if (isUtcTimeOnlyString(normalizedValue)) {
    return tryParse(() => {
      const resolvedTimeZone = resolveTimeFieldTimeZone(timeZone);
      return parseAbsolute(`1970-01-01T${normalizedValue}`, resolvedTimeZone);
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
  ];

  return (
    parsers
      .map((parser) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return tryParse(parser);
      })
      .find((parsedValue) => {
        return parsedValue != null;
      }) ?? null
  );
};

/** Resolve the timezone used for parsing and string conversion. */
export const resolveTimeFieldTimeZone = (timeZone?: string): string => {
  return timeZone ?? getLocalTimeZone();
};

/**
 * Build default placeholder value for TimeInput.
 *
 * Uses a fixed reference time to keep snapshots deterministic.
 */
export const getTimeFieldPlaceholderValue = (timeZone?: string): TimeValue => {
  const resolvedTimeZone = resolveTimeFieldTimeZone(timeZone);
  return asTimeValue(
    parseZonedDateTime(`1970-01-01T00:00:00[${resolvedTimeZone}]`),
  );
};

/**
 * Convert a TimeValue into a UTC time-only string for form state.
 *
 * The stored format is `HH:mmZ` (or `HH:00Z` when granularity is `hour`).
 */
export const timeValueToString = (
  value: TimeValue,
  timeZone: string,
  granularity: 'hour' | 'minute' = 'minute',
): string | null => {
  if (value == null) {
    return null;
  }

  const maybeWithAbsoluteString = value as { toAbsoluteString?: () => string };
  if (typeof maybeWithAbsoluteString.toAbsoluteString === 'function') {
    return toUtcTimeString(
      maybeWithAbsoluteString.toAbsoluteString(),
      granularity,
    );
  }

  const maybeWithToDate = value as { toDate?: (zone: string) => Date };
  if (typeof maybeWithToDate.toDate === 'function') {
    return toUtcTimeString(
      maybeWithToDate.toDate(timeZone).toISOString(),
      granularity,
    );
  }

  const maybeTime = value as {
    hour?: number;
    minute?: number;
    second?: number;
  };
  if (
    typeof maybeTime.hour === 'number' &&
    typeof maybeTime.minute === 'number'
  ) {
    const hour = pad(maybeTime.hour);
    const minute = pad(maybeTime.minute);
    const second = pad(maybeTime.second ?? 0);
    return toUtcTimeString(
      parseZonedDateTime(
        `1970-01-01T${hour}:${minute}:${second}[${timeZone}]`,
      ).toAbsoluteString(),
      granularity,
    );
  }

  return null;
};
