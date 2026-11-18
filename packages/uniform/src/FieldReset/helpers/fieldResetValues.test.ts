import { describe, expect, it } from 'vitest';

import { isFieldValueChanged, toFormFieldValue } from './fieldResetValues';

describe('FieldReset payloads', () => {
  it('compares numbers, false, empty values, objects and wrapped arrays', () => {
    expect(isFieldValueChanged('4', 4)).toBe(false);
    expect(isFieldValueChanged('4.0', 4)).toBe(false);
    expect(isFieldValueChanged('04', 4)).toBe(false);
    expect(isFieldValueChanged('0.0', 0)).toBe(false);
    expect(isFieldValueChanged('  ', 0)).toBe(true);
    expect(isFieldValueChanged('04', '4')).toBe(true);
    expect(isFieldValueChanged('__ZERO__', 0)).toBe(false);
    expect(isFieldValueChanged('__FALSE__', false)).toBe(false);
    expect(isFieldValueChanged('', null)).toBe(false);
    expect(isFieldValueChanged({}, undefined)).toBe(false);
    expect(isFieldValueChanged(toFormFieldValue(['a', 'b']), ['a', 'b'])).toBe(
      false,
    );
    expect(isFieldValueChanged(toFormFieldValue(['b', 'a']), ['a', 'b'])).toBe(
      true,
    );
    expect(
      isFieldValueChanged({ cpu: '4', memory: '16' }, { memory: 16, cpu: 4 }),
    ).toBe(false);
  });
});
