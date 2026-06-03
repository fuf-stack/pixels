import { describe, expect, it } from 'vitest';

import {
  getLocalTimeZone,
  now,
  parseAbsolute,
  parseAbsoluteToLocal,
  parseDate,
  parseDateTime,
  parseZonedDateTime,
} from '@internationalized/date';

import {
  dateValueToUtcIsoString,
  getDatePickerPlaceholderValue,
  parseDateValue,
  resolveDatePickerTimeZone,
} from './dateHelpers';

describe('parseDateValue', () => {
  it('returns null for nullish and empty values', () => {
    expect(parseDateValue(null)).toBeNull();
    expect(parseDateValue(undefined)).toBeNull();
    expect(parseDateValue('')).toBeNull();
    expect(parseDateValue('   ')).toBeNull();
  });

  it('returns date-like objects unchanged', () => {
    const value = parseDate('2026-05-30');
    expect(parseDateValue(value)).toBe(value);
  });

  it('parses native Date instances as local zoned values', () => {
    const value = new Date('2026-05-30T10:15:00.000Z');
    expect(parseDateValue(value)?.toString()).toBe(
      parseAbsoluteToLocal('2026-05-30T10:15:00.000Z').toString(),
    );
  });

  it('parses native Date instances with explicit timezone', () => {
    const value = new Date('2026-05-30T10:15:00.000Z');
    expect(parseDateValue(value, 'Europe/Berlin')?.toString()).toBe(
      parseAbsolute('2026-05-30T10:15:00.000Z', 'Europe/Berlin').toString(),
    );
  });

  it('returns null for non-string primitive values', () => {
    expect(parseDateValue(123)).toBeNull();
    expect(parseDateValue(true)).toBeNull();
  });

  it('parses date-only strings', () => {
    expect(parseDateValue('2026-05-30')?.toString()).toBe(
      parseDate('2026-05-30').toString(),
    );
  });

  it('parses absolute datetime strings first', () => {
    const value = '2026-05-30T10:15:00.000Z';
    expect(parseDateValue(value)?.toString()).toBe(
      parseAbsoluteToLocal(value).toString(),
    );
  });

  it('parses absolute datetime strings with explicit timezone', () => {
    const value = '2026-05-30T10:15:00.000Z';
    expect(parseDateValue(value, 'America/New_York')?.toString()).toBe(
      parseAbsolute(value, 'America/New_York').toString(),
    );
  });

  it('parses zoned datetime strings', () => {
    const value = '2026-05-30T10:15[Europe/Berlin]';
    expect(parseDateValue(value)?.toString()).toBe(
      parseZonedDateTime(value).toString(),
    );
  });

  it('parses local calendar datetime strings', () => {
    const value = '2026-05-30T10:15:00';
    expect(parseDateValue(value)?.toString()).toBe(
      parseDateTime(value).toString(),
    );
  });

  it('parses local calendar datetime strings into timezone when provided', () => {
    const value = '2026-05-30T10:15:00';
    expect(parseDateValue(value, 'Europe/Berlin')?.toString()).toBe(
      parseZonedDateTime('2026-05-30T10:15:00[Europe/Berlin]').toString(),
    );
  });

  it('preserves existing zoned datetime strings when timezone is provided', () => {
    const value = '2026-05-30T10:15[Europe/Berlin]';
    expect(parseDateValue(value, 'America/New_York')?.toString()).toBe(
      parseZonedDateTime(value).toString(),
    );
  });

  it('returns null for invalid strings', () => {
    expect(parseDateValue('not-a-date')).toBeNull();
  });
});

describe('dateValueToUtcIsoString', () => {
  it('returns null for nullish values', () => {
    expect(dateValueToUtcIsoString(null, getLocalTimeZone())).toBeNull();
  });

  it('converts ZonedDateTime values to UTC ISO', () => {
    const value = parseDateValue('2026-05-30T10:15:00[Europe/Berlin]');
    expect(dateValueToUtcIsoString(value, 'America/New_York')).toBe(
      parseZonedDateTime(
        '2026-05-30T10:15:00[Europe/Berlin]',
      ).toAbsoluteString(),
    );
  });

  it('converts CalendarDateTime values using provided timezone', () => {
    const value = parseDateValue('2026-05-30T10:15:00');
    expect(dateValueToUtcIsoString(value, 'Europe/Berlin')).toBe(
      parseZonedDateTime(
        '2026-05-30T10:15:00[Europe/Berlin]',
      ).toAbsoluteString(),
    );
  });

  it('converts CalendarDate values using provided timezone midnight', () => {
    const value = parseDateValue('2026-05-30');
    expect(dateValueToUtcIsoString(value, 'America/New_York')).toBe(
      parseZonedDateTime(
        '2026-05-30T00:00:00[America/New_York]',
      ).toAbsoluteString(),
    );
  });
});

describe('resolveDatePickerTimeZone', () => {
  it('returns explicit timezone for date-only mode', () => {
    expect(resolveDatePickerTimeZone(false, 'America/New_York')).toBe(
      'America/New_York',
    );
  });

  it('returns local timezone for time-enabled mode when omitted', () => {
    expect(resolveDatePickerTimeZone(true)).toBe(getLocalTimeZone());
  });

  it('returns explicit timezone for time-enabled mode when provided', () => {
    expect(resolveDatePickerTimeZone(true, 'UTC')).toBe('UTC');
  });
});

describe('getDatePickerPlaceholderValue', () => {
  it('returns undefined for date-only mode', () => {
    expect(getDatePickerPlaceholderValue(false, 'UTC')).toBeUndefined();
  });

  it('returns placeholder for explicit timezone in time mode', () => {
    expect(getDatePickerPlaceholderValue(true, 'UTC')?.toString()).toBe(
      now('UTC').toString(),
    );
  });

  it('returns placeholder using local timezone fallback in time mode', () => {
    expect(getDatePickerPlaceholderValue(true)?.toString()).toBe(
      now(getLocalTimeZone()).toString(),
    );
  });
});
