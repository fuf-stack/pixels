import { describe, expect, it } from 'vitest';

import {
  fromNullishString,
  toFormFormat,
  toNullishString,
  toValidationFormat,
} from './nullishFields';

describe('toNullishString', () => {
  it('should convert values to nullish strings', () => {
    expect(toNullishString(null)).toBe('__NULL__');
    expect(toNullishString('')).toBe('__NULL__');
    expect(toNullishString(false)).toBe('__FALSE__');
    expect(toNullishString(0)).toBe('__ZERO__');
  });

  it('should preserve non-nullish values', () => {
    expect(toNullishString('test')).toBe('test');
    expect(toNullishString(42)).toBe(42);
    expect(toNullishString(true)).toBe(true);
    expect(toNullishString({})).toEqual({});
    expect(toNullishString([])).toEqual([]);
    expect(toNullishString(undefined)).toBe(undefined);
  });
});

describe('fromNullishString', () => {
  it('should convert from nullish strings', () => {
    expect(fromNullishString('__NULL__')).toBe(null);
    expect(fromNullishString('__FALSE__')).toBe(false);
    expect(fromNullishString('__ZERO__')).toBe(0);
  });

  it('should preserve non-marker strings and other values', () => {
    expect(fromNullishString('test')).toBe('test');
    expect(fromNullishString(42)).toBe(42);
    expect(fromNullishString(true)).toBe(true);
    expect(fromNullishString({})).toEqual({});
    expect(fromNullishString([])).toEqual([]);
    expect(fromNullishString(undefined)).toBe(undefined);
    expect(fromNullishString(null)).toBe(null);
    expect(fromNullishString(false)).toBe(false);
    expect(fromNullishString(0)).toBe(0);
  });
});

describe('toFormFormat', () => {
  it('should remove empty strings and nulls from objects', () => {
    const input = {
      value: 'test',
      empty: '',
      nullValue: null,
      zero: 0,
      falseValue: false,
    };

    const expected = {
      value: 'test',
      zero: 0,
      falseValue: false,
    };

    expect(toFormFormat(input)).toEqual(expected);
  });

  it('should handle nested objects', () => {
    const input = {
      field: {
        value: 'test',
        empty: '',
        nullValue: null,
        nested: {
          value: 'test',
          empty: '',
          nullValue: null,
        },
      },
    };

    const expected = {
      field: {
        value: 'test',
        nested: {
          value: 'test',
        },
      },
    };

    expect(toFormFormat(input)).toEqual(expected);
  });

  it('should convert arrays to use string markers', () => {
    const input = {
      array: ['value', '', null, 0, false],
    };

    const expected = {
      array: ['value', '__NULL__', '__NULL__', '__ZERO__', '__FALSE__'],
    };

    expect(toFormFormat(input)).toEqual(expected);
  });

  it('should handle objects with all nullish values', () => {
    const input = {
      empty: '',
      nullValue: null,
      nested: {
        empty: '',
        nullValue: null,
      },
    };

    const expected = {
      nested: {},
    };

    expect(toFormFormat(input)).toEqual(expected);
  });
});

describe('toValidationFormat', () => {
  it('should convert from form format back to original values', () => {
    const input = {
      array: ['value', '__NULL__', '__NULL__', '__ZERO__', '__FALSE__'],
      string: '__NULL__',
      null: null,
      nullString: '__NULL__',
      zero: '__ZERO__',
      false: '__FALSE__',
      contact: {
        address: '123 Main St',
        phone: '__NULL__',
        fax: null,
        score: '__ZERO__',
        active: '__FALSE__',
      },
    };

    const expected = {
      array: ['value', null, null, 0, false],
      zero: 0,
      false: false,
      contact: {
        address: '123 Main St',
        score: 0,
        active: false,
      },
    };

    expect(toValidationFormat(input)).toEqual(expected);
  });

  it('should handle objects with all nullish values', () => {
    const input = {
      empty: '__NULL__',
      nullValue: null,
      nullString: '__NULL__',
      nested: {
        empty: '__NULL__',
        nullValue: null,
        nullString: '__NULL__',
      },
    };

    const expected = {
      nested: {},
    };

    expect(toValidationFormat(input)).toEqual(expected);
  });
});

describe('round trip conversion', () => {
  it('should maintain data integrity through format conversions', () => {
    const original = {
      arrayField: ['value', '', null, 0, false],
      objectField: {
        name: 'test',
        empty: '',
        nullValue: null,
        zero: 0,
        falseValue: false,
      },
    };

    const formFormat = toFormFormat(original);
    const backToValidation = toValidationFormat(formFormat);

    const expected = {
      arrayField: ['value', null, null, 0, false],
      objectField: {
        name: 'test',
        zero: 0,
        falseValue: false,
      },
    };

    expect(backToValidation).toEqual(expected);
  });
});
