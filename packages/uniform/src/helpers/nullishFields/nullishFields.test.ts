import { describe, expect, it } from 'vitest';

import {
  flatArrayKey,
  fromNullishString,
  nameToTestId,
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

  it('should wrap primitive arrays using flatArrayKey', () => {
    const input = {
      array: ['value', '', null, 0, false],
    };

    const result = toFormFormat(input);
    expect(Array.isArray(result.array)).toBe(true);
    // Each entry should be an object wrapper with raw primitive stored under flatArrayKey
    expect(result.array).toEqual([
      { [flatArrayKey]: 'value' },
      { [flatArrayKey]: '' },
      { [flatArrayKey]: null },
      { [flatArrayKey]: 0 },
      { [flatArrayKey]: false },
    ]);
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
  it('should convert from form format back to original values (legacy markers)', () => {
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

  it('should unwrap flatArrayKey wrappers back to primitives', () => {
    const input = {
      array: [
        { [flatArrayKey]: 'value' },
        { [flatArrayKey]: '' },
        { [flatArrayKey]: null },
        { [flatArrayKey]: 0 },
        { [flatArrayKey]: false },
      ],
    } as unknown as Record<string, unknown>;

    const expected = {
      array: ['value', null, null, 0, false],
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

  it('should handle undefined input', () => {
    const result = toValidationFormat(undefined);
    expect(result).toBeUndefined();
  });

  it('should handle null input', () => {
    const result = toValidationFormat(null);
    expect(result).toBeNull();
  });

  it('should remove empty arrays', () => {
    const input = {
      emptyArray: [],
      nonEmptyArray: [{ [flatArrayKey]: 'value' }],
      nestedObject: {
        emptyArray: [],
        value: 'test',
      },
    } as unknown as Record<string, unknown>;

    const expected = {
      nonEmptyArray: ['value'],
      nestedObject: {
        value: 'test',
      },
    };

    expect(toValidationFormat(input)).toEqual(expected);
  });

  it('should remove empty arrays with mixed content', () => {
    const input = {
      name: 'John',
      tags: [],
      scores: [{ [flatArrayKey]: 75 }],
      emptyNested: {
        items: [],
        otherField: 'value',
      },
    } as unknown as Record<string, unknown>;

    const expected = {
      name: 'John',
      scores: [75],
      emptyNested: {
        otherField: 'value',
      },
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

describe('nameToTestId', () => {
  describe('string input', () => {
    it('should remove single flat array key from field name and slugify', () => {
      expect(nameToTestId('tags.0.__FLAT__')).toBe('tags_0');
      expect(nameToTestId('array.1.__FLAT__')).toBe('array_1');
    });

    it('should remove multiple flat array keys from field name and slugify', () => {
      expect(nameToTestId('nested.array.0.__FLAT__.field.__FLAT__')).toBe(
        'nested_array_0_field',
      );
      expect(nameToTestId('a.__FLAT__.b.__FLAT__.c')).toBe('a_b_c');
    });

    it('should handle field names without flat array keys and slugify', () => {
      expect(nameToTestId('simple.field')).toBe('simple_field');
      expect(nameToTestId('user.name')).toBe('user_name');
      expect(nameToTestId('array.0.name')).toBe('array_0_name');
    });

    it('should handle flat array key at the start and slugify', () => {
      expect(nameToTestId('__FLAT__.field')).toBe('field');
      expect(nameToTestId('__FLAT__')).toBe('');
    });

    it('should handle flat array key at the end and slugify', () => {
      expect(nameToTestId('field.__FLAT__')).toBe('field');
      expect(nameToTestId('array.0.__FLAT__')).toBe('array_0');
    });

    it('should handle consecutive flat array keys and slugify', () => {
      expect(nameToTestId('field.__FLAT__.__FLAT__.other')).toBe('field_other');
      expect(nameToTestId('__FLAT__.__FLAT__.__FLAT__')).toBe('');
    });

    it('should handle complex nested paths and slugify', () => {
      expect(nameToTestId('user.tags.0.__FLAT__')).toBe('user_tags_0');
      expect(nameToTestId('form.data.items.1.__FLAT__')).toBe(
        'form_data_items_1',
      );
      expect(
        nameToTestId('nested.array.0.__FLAT__.metadata.tags.0.__FLAT__'),
      ).toBe('nested_array_0_metadata_tags_0');
    });

    it('should handle edge cases and slugify', () => {
      expect(nameToTestId('')).toBe('');
      expect(nameToTestId('single')).toBe('single');
      expect(nameToTestId('a.b.c')).toBe('a_b_c');
    });
  });

  describe('array input', () => {
    it('should remove single flat array key from array path and slugify', () => {
      expect(nameToTestId(['tags', '0', '__FLAT__'])).toBe('tags_0');
      expect(nameToTestId(['array', '1', '__FLAT__'])).toBe('array_1');
    });

    it('should remove multiple flat array keys from array path and slugify', () => {
      expect(
        nameToTestId(['nested', 'array', '0', '__FLAT__', 'field', '__FLAT__']),
      ).toBe('nested_array_0_field');
      expect(nameToTestId(['a', '__FLAT__', 'b', '__FLAT__', 'c'])).toBe(
        'a_b_c',
      );
    });

    it('should handle array paths without flat array keys and slugify', () => {
      expect(nameToTestId(['simple', 'field'])).toBe('simple_field');
      expect(nameToTestId(['user', 'name'])).toBe('user_name');
      expect(nameToTestId(['array', '0', 'name'])).toBe('array_0_name');
    });

    it('should handle flat array key at the start of array and slugify', () => {
      expect(nameToTestId(['__FLAT__', 'field'])).toBe('field');
      expect(nameToTestId(['__FLAT__'])).toBe('');
    });

    it('should handle flat array key at the end of array and slugify', () => {
      expect(nameToTestId(['field', '__FLAT__'])).toBe('field');
      expect(nameToTestId(['array', '0', '__FLAT__'])).toBe('array_0');
    });

    it('should handle consecutive flat array keys in array and slugify', () => {
      expect(nameToTestId(['field', '__FLAT__', '__FLAT__', 'other'])).toBe(
        'field_other',
      );
      expect(nameToTestId(['__FLAT__', '__FLAT__', '__FLAT__'])).toBe('');
    });

    it('should handle complex nested array paths and slugify', () => {
      expect(nameToTestId(['user', 'tags', '0', '__FLAT__'])).toBe(
        'user_tags_0',
      );
      expect(
        nameToTestId([
          'nested',
          'array',
          '0',
          '__FLAT__',
          'metadata',
          'tags',
          '0',
          '__FLAT__',
        ]),
      ).toBe('nested_array_0_metadata_tags_0');
    });

    it('should handle edge cases with arrays and slugify', () => {
      expect(nameToTestId([])).toBe('');
      expect(nameToTestId(['single'])).toBe('single');
      expect(nameToTestId(['a', 'b', 'c'])).toBe('a_b_c');
    });
  });
});
