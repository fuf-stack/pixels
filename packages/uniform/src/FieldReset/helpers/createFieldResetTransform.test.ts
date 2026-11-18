import { describe, expect, it } from 'vitest';

import { toNullishString } from '../../helpers';
import createFieldResetTransform from './createFieldResetTransform';

const transform = (
  resetValue: NonNullable<unknown> = 4,
  storedValue: unknown = undefined,
  include: 'changed' | 'always' = 'changed',
) => createFieldResetTransform<unknown>({ resetValue, storedValue, include });

describe('createFieldResetTransform', () => {
  it.each([undefined, toNullishString(null)])(
    'displays the reset value for an omitted update (%s)',
    (storedValue) => {
      expect(transform(4, storedValue).toDisplayValue(null)).toBe(4);
      expect(transform(0, storedValue).toDisplayValue(null)).toBe(0);
      expect(transform(false, storedValue).toDisplayValue(null)).toBe(false);
    },
  );

  it('uses the decoded display value for edits and preserves clears', () => {
    expect(transform(4, '8').toDisplayValue(8)).toBe(8);
    expect(transform(true, toNullishString(false)).toDisplayValue(false)).toBe(
      false,
    );
    expect(transform(4, toNullishString(0)).toDisplayValue(0)).toBe(0);
    expect(transform('hello', null).toDisplayValue(null)).toBe('');
    expect(transform('hello', '').toDisplayValue('')).toBe('');
  });

  it.each([4, '4', '4.0', '04', '4e0', ' 4 '])(
    'omits an equivalent numeric value (%s) only in changed mode',
    (value) => {
      expect(transform().toFormValue(value)).toBeNull();
      expect(transform(4, undefined, 'always').toFormValue(value)).toBe(4);
    },
  );

  it('compares falsy values, arrays and objects without losing changed values', () => {
    expect(transform(false).toFormValue(false)).toBeNull();
    expect(transform(false).toFormValue(true)).toBe(true);
    expect(transform(0).toFormValue('0')).toBeNull();
    expect(transform(['a', 'b']).toFormValue(['a', 'b'])).toBeNull();
    expect(transform(['a', 'b']).toFormValue(['b', 'a'])).toEqual(['b', 'a']);
    expect(transform({ cpu: 4 }).toFormValue({ cpu: '4' })).toBeNull();
    expect(transform({ cpu: 4 }).toFormValue({ cpu: 8 })).toEqual({ cpu: 8 });
  });

  it.each(['changed', 'always'] as const)(
    'keeps clears distinct from omission in %s mode',
    (include) => {
      const mapping = transform(4, undefined, include);
      expect(mapping.toFormValue(null)).toBe('');
      expect(mapping.toFormValue(undefined)).toBe('');
      expect(mapping.toFormValue('')).toBe('');
      expect(mapping.toFormValue([])).toEqual([]);
    },
  );

  it('converts numeric edits without turning blank or invalid text into numbers', () => {
    const mapping = transform();
    expect(mapping.toFormValue('8')).toBe(8);
    expect(mapping.toFormValue('0')).toBe(0);
    expect(mapping.toFormValue('-2.5')).toBe(-2.5);
    expect(mapping.toFormValue('  ')).toBe('  ');
    expect(mapping.toFormValue('invalid')).toBe('invalid');
    expect(transform('4').toFormValue('8')).toBe('8');
  });
});
