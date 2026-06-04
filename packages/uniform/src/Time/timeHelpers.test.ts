import { describe, expect, it } from 'vitest';

import {
  getLocalTimeZone,
  parseAbsolute,
  parseAbsoluteToLocal,
  parseDateTime,
  parseTime,
  parseZonedDateTime,
} from '@internationalized/date';

import {
  getTimeFieldPlaceholderValue,
  parseTimeValue,
  resolveTimeFieldTimeZone,
  timeValueToString,
} from './timeHelpers';

describe('parseTimeValue', () => {
  it('returns null for nullish and empty values', () => {
    expect(parseTimeValue(null)).toBeNull();
    expect(parseTimeValue(undefined)).toBeNull();
    expect(parseTimeValue('')).toBeNull();
    expect(parseTimeValue('   ')).toBeNull();
  });

  it('returns time-like objects unchanged', () => {
    const value = parseTime('10:15:00');
    expect(parseTimeValue(value)).toBe(value);
  });

  it('parses native Date instances as local zoned values', () => {
    const value = new Date('2026-05-30T10:15:00.000Z');
    expect(parseTimeValue(value)?.toString()).toBe(
      parseAbsoluteToLocal('2026-05-30T10:15:00.000Z').toString(),
    );
  });

  it('parses native Date instances with explicit timezone', () => {
    const value = new Date('2026-05-30T10:15:00.000Z');
    expect(parseTimeValue(value, 'Europe/Berlin')?.toString()).toBe(
      parseAbsolute('2026-05-30T10:15:00.000Z', 'Europe/Berlin').toString(),
    );
  });

  it('returns null for non-string primitive values', () => {
    expect(parseTimeValue(123)).toBeNull();
    expect(parseTimeValue(true)).toBeNull();
  });

  it('parses time-only strings', () => {
    expect(parseTimeValue('10:15:00')?.toString()).toBe(
      parseZonedDateTime(
        `1970-01-01T10:15:00[${getLocalTimeZone()}]`,
      ).toString(),
    );
  });

  it('parses time-only strings into explicit timezone when provided', () => {
    expect(parseTimeValue('10:15:00', 'Europe/Berlin')?.toString()).toBe(
      parseZonedDateTime('1970-01-01T10:15:00[Europe/Berlin]').toString(),
    );
  });

  it('parses utc minute-only strings into the active timezone', () => {
    expect(parseTimeValue('10:15Z', 'Europe/Berlin')?.toString()).toBe(
      parseAbsolute('1970-01-01T10:15:00.000Z', 'Europe/Berlin').toString(),
    );
  });

  it('parses legacy utc time strings with seconds and millis', () => {
    expect(parseTimeValue('10:15:00.000Z', 'Europe/Berlin')?.toString()).toBe(
      parseAbsolute('1970-01-01T10:15:00.000Z', 'Europe/Berlin').toString(),
    );
  });

  it('parses absolute datetime strings', () => {
    const value = '2026-05-30T10:15:00.000Z';
    expect(parseTimeValue(value)?.toString()).toBe(
      parseAbsoluteToLocal(value).toString(),
    );
  });

  it('parses absolute datetime strings with explicit timezone', () => {
    const value = '2026-05-30T10:15:00.000Z';
    expect(parseTimeValue(value, 'America/New_York')?.toString()).toBe(
      parseAbsolute(value, 'America/New_York').toString(),
    );
  });

  it('parses zoned datetime strings', () => {
    const value = '2026-05-30T10:15:00[Europe/Berlin]';
    expect(parseTimeValue(value)?.toString()).toBe(
      parseZonedDateTime(value).toString(),
    );
  });

  it('parses local datetime strings', () => {
    const value = '2026-05-30T10:15:00';
    expect(parseTimeValue(value)?.toString()).toBe(
      parseDateTime(value).toString(),
    );
  });

  it('parses local datetime strings into timezone when provided', () => {
    const value = '2026-05-30T10:15:00';
    expect(parseTimeValue(value, 'Europe/Berlin')?.toString()).toBe(
      parseZonedDateTime('2026-05-30T10:15:00[Europe/Berlin]').toString(),
    );
  });

  it('returns null for invalid strings', () => {
    expect(parseTimeValue('not-a-time')).toBeNull();
  });
});

describe('timeValueToString', () => {
  it('returns null for nullish values', () => {
    expect(timeValueToString(null, 'UTC')).toBeNull();
  });

  it('serializes Time values as UTC minute-only string', () => {
    const value = parseTime('10:15:00');
    expect(timeValueToString(value, 'UTC')).toBe('10:15Z');
  });

  it('serializes Time values as UTC minute-only using provided timezone', () => {
    const value = parseTime('10:15:00');
    expect(timeValueToString(value, 'Europe/Berlin')).toBe('09:15Z');
  });

  it('serializes Time values as full UTC hour when granularity is hour', () => {
    const value = parseTime('10:15:00');
    expect(timeValueToString(value, 'Europe/Berlin', 'hour')).toBe('09:00Z');
  });

  it('serializes ZonedDateTime values as UTC minute-only string', () => {
    const value = parseZonedDateTime('2026-05-30T10:15:00[Europe/Berlin]');
    expect(timeValueToString(value, 'America/New_York')).toBe('08:15Z');
  });

  it('serializes CalendarDateTime values as UTC minute-only using timezone', () => {
    const value = parseDateTime('2026-05-30T10:15:00');
    expect(timeValueToString(value, 'Europe/Berlin')).toBe('08:15Z');
  });

  it('serializes ZonedDateTime values as full UTC hour when granularity is hour', () => {
    const value = parseZonedDateTime('2026-05-30T10:15:00[Europe/Berlin]');
    expect(timeValueToString(value, 'America/New_York', 'hour')).toBe('08:00Z');
  });
});

describe('resolveTimeFieldTimeZone', () => {
  it('returns explicit timezone when provided', () => {
    expect(resolveTimeFieldTimeZone('America/New_York')).toBe(
      'America/New_York',
    );
  });

  it('falls back to local timezone when omitted', () => {
    expect(resolveTimeFieldTimeZone()).toBe(getLocalTimeZone());
  });
});

describe('getTimeFieldPlaceholderValue', () => {
  it('returns fixed placeholder for explicit timezone', () => {
    expect(getTimeFieldPlaceholderValue('UTC')?.toString()).toBe(
      parseZonedDateTime('1970-01-01T00:00:00[UTC]').toString(),
    );
  });

  it('returns fixed placeholder for local timezone fallback', () => {
    expect(getTimeFieldPlaceholderValue()?.toString()).toBe(
      parseZonedDateTime(
        `1970-01-01T00:00:00[${getLocalTimeZone()}]`,
      ).toString(),
    );
  });
});
